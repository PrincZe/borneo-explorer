import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify customer owns this booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, booking_ref, status')
    .eq('id', id)
    .eq('customer_user_id', user.id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.status !== 'pending_payment') {
    return NextResponse.json({ error: 'Receipt already submitted' }, { status: 409 })
  }

  const formData = await request.formData()
  const file = formData.get('receipt') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'File must be JPEG, PNG, WebP, or PDF' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 })
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const fileExt = file.name.split('.').pop()
  const fileName = `${booking.booking_ref}-${Date.now()}.${fileExt}`
  const arrayBuffer = await file.arrayBuffer()

  const { data: uploadData, error: uploadError } = await adminClient.storage
    .from('receipts')
    .upload(fileName, arrayBuffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: 'Upload failed', detail: uploadError.message }, { status: 500 })
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ payment_receipt_url: uploadData.path, status: 'pending_verification' })
    .eq('id', id)
    .eq('customer_user_id', user.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
