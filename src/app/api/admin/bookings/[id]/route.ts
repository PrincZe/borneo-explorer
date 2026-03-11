import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { sendBookingStatusEmail } from '@/lib/email'
import type { Database } from '@/types/database'

type BookingUpdate = Database['public']['Tables']['bookings']['Update']

const updateSchema = z.object({
  status: z.enum(['pending_payment', 'pending_verification', 'confirmed', 'cancelled']).optional(),
  admin_notes: z.string().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['company_admin', 'backend_team', 'ship_worker'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      room_type:room_types(id, name, slug, bed_type, size_sqm),
      package:packages(id, name, slug, duration_days, num_dives)
    `)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  // Generate signed URL for receipt using admin client (service role)
  let receiptSignedUrl: string | null = null
  if (booking.payment_receipt_url) {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    const { data } = await adminClient.storage
      .from('receipts')
      .createSignedUrl(booking.payment_receipt_url, 3600)
    receiptSignedUrl = data?.signedUrl ?? null
  }

  return NextResponse.json({ booking: { ...booking, receipt_signed_url: receiptSignedUrl } })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['company_admin', 'backend_team'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const updates = updateSchema.parse(body)

  const updateData: BookingUpdate = { ...updates }
  if (updates.status === 'confirmed') {
    updateData.verified_by = user.id
    updateData.verified_at = new Date().toISOString()

    // Calculate affiliate commission on confirmation
    const { data: currentBooking } = await supabase
      .from('bookings')
      .select('total_amount, promo_code_id')
      .eq('id', id)
      .single()

    if (currentBooking?.promo_code_id && currentBooking?.total_amount) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('affiliate_id, affiliates(commission_rate)')
        .eq('id', currentBooking.promo_code_id)
        .single()

      const commissionRate = (promo?.affiliates as { commission_rate: number } | null)?.commission_rate ?? 0
      updateData.affiliate_commission = Math.round(currentBooking.total_amount * commissionRate / 100 * 100) / 100
    }
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send status email if status changed to confirmed or cancelled
  if (updates.status === 'confirmed' || updates.status === 'cancelled') {
    sendBookingStatusEmail(booking, updates.status).catch(console.error)
  }

  return NextResponse.json({ booking })
}
