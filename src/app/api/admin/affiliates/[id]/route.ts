import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  is_active: z.boolean().optional(),
  notes: z.string().optional(),
})

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['company_admin', 'backend_team'].includes(profile.role)) return null
  return user
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: affiliate, error } = await supabase
    .from('affiliates')
    .select(`*, promo_codes(*)`)
    .eq('id', id)
    .single()

  if (error || !affiliate) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Commission summary: sum of affiliate_commission on confirmed bookings via this affiliate's codes
  const codeIds = (affiliate.promo_codes as { id: string }[]).map(c => c.id)
  let totalCommission = 0
  let totalBookings = 0

  if (codeIds.length > 0) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('affiliate_commission, status')
      .in('promo_code_id', codeIds)
      .eq('status', 'confirmed')

    totalBookings = bookings?.length ?? 0
    totalCommission = bookings?.reduce((sum, b) => sum + (b.affiliate_commission ?? 0), 0) ?? 0
  }

  return NextResponse.json({ affiliate, total_bookings: totalBookings, total_commission: totalCommission })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const updates = updateSchema.parse(body)

  const { data, error } = await supabase
    .from('affiliates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ affiliate: data })
}
