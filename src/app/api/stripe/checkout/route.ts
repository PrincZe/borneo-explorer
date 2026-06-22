import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const { booking_id } = await request.json()

  if (!booking_id) {
    return NextResponse.json({ error: 'booking_id required' }, { status: 400 })
  }

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, booking_ref, total_amount, customer_email, status, payment_method, num_guests, room_type:room_types(name), package:packages(name)')
    .eq('id', booking_id)
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  if (booking.status !== 'pending_payment') {
    return NextResponse.json({ error: 'Booking already processed' }, { status: 400 })
  }
  if (booking.payment_method !== 'stripe') {
    return NextResponse.json({ error: 'Not a Stripe booking' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    currency: 'myr',
    customer_email: booking.customer_email,
    line_items: [{
      price_data: {
        currency: 'myr',
        product_data: {
          name: `Dive Booking ${booking.booking_ref}`,
          description: [
            (booking.room_type as unknown as { name: string } | null)?.name,
            (booking.package as unknown as { name: string } | null)?.name,
            `${booking.num_guests} guest${booking.num_guests > 1 ? 's' : ''}`,
          ].filter(Boolean).join(' — '),
        },
        unit_amount: Math.round((booking.total_amount ?? 0) * 100),
      },
      quantity: 1,
    }],
    metadata: {
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/confirmation/${booking.id}?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/confirmation/${booking.id}?payment=cancelled`,
  })

  return NextResponse.json({ checkoutUrl: session.url })
}
