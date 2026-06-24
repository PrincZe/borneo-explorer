import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendBookingStatusEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object
    const bookingId = session.metadata?.booking_id

    if (bookingId) {
      const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      )

      await supabase
        .from('bookings')
        .update({ status: 'cancelled', admin_notes: 'Auto-cancelled: Stripe checkout session expired' })
        .eq('id', bookingId)
        .eq('status', 'pending_payment')
    }

    return NextResponse.json({ received: true })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const bookingId = session.metadata?.booking_id

    if (!bookingId) {
      console.error('Webhook: No booking_id in session metadata')
      return NextResponse.json({ received: true })
    }

    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, status, customer_name, customer_email, booking_ref, total_amount, promo_code_id')
      .eq('id', bookingId)
      .single()

    if (!booking || booking.status !== 'pending_payment') {
      return NextResponse.json({ received: true })
    }

    const updateData: Record<string, unknown> = {
      status: 'confirmed',
      verified_at: new Date().toISOString(),
    }

    if (booking.promo_code_id && booking.total_amount) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('affiliate_id, affiliates(commission_rate)')
        .eq('id', booking.promo_code_id)
        .single()

      const affiliate = promo?.affiliates as unknown as { commission_rate: number } | null
      if (affiliate?.commission_rate) {
        updateData.affiliate_commission = Math.round(booking.total_amount * affiliate.commission_rate / 100 * 100) / 100
      }
    }

    await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)

    await supabase.from('booking_audit_logs').insert({
      booking_id: bookingId,
      changed_by: null,
      changed_by_name: 'Stripe',
      action: 'status_changed',
      old_value: 'pending_payment',
      new_value: 'confirmed',
    })

    sendBookingStatusEmail(booking as never, 'confirmed').catch(console.error)
  }

  return NextResponse.json({ received: true })
}
