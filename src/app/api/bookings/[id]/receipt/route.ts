import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const formData = await request.formData()
  const file = formData.get('receipt') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No receipt file provided' }, { status: 400 })
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'File must be JPEG, PNG, WebP, or PDF' }, { status: 400 })
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 })
  }

  const supabase = await createClient()

  // Verify booking exists
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, booking_ref, status')
    .eq('id', id)
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (booking.status !== 'pending_payment') {
    return NextResponse.json({ error: 'Receipt can only be uploaded for bookings awaiting payment' }, { status: 400 })
  }

  // Use admin client (service role) for storage upload — bypasses RLS safely on server
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
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return NextResponse.json({ error: 'Failed to upload receipt', detail: uploadError.message }, { status: 500 })
  }

  const receiptUrl = uploadData.path

  // Update booking status (use regular client — RLS allows public update)
  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({
      payment_receipt_url: receiptUrl,
      status: 'pending_verification',
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ booking: updatedBooking })
}
