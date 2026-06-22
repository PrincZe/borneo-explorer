import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { sendBookingConfirmationEmail, sendAdminNewBookingNotification } from '@/lib/email'
import type { Database } from '@/types/database'

type BookingInsert = Database['public']['Tables']['bookings']['Insert']

const bookingSchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().optional(),
  room_type_id: z.string().uuid(),
  package_id: z.string().uuid(),
  check_in_date: z.string(),
  check_out_date: z.string(),
  num_guests: z.number().int().min(1).max(10),
  certification_level: z.string().optional(),
  logged_dives: z.number().int().optional(),
  nitrox_required: z.boolean().default(false),
  equipment_rental: z.boolean().default(false),
  add_ons: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    notes: z.string().optional(),
  })).default([]),
  cabins: z.array(z.object({
    room_type_id: z.string(),
    room_name: z.string(),
  })).default([]),
  special_requests: z.string().optional(),
  promo_code: z.string().optional(),
  payment_method: z.enum(['bank_transfer', 'stripe']).default('bank_transfer'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = bookingSchema.parse(body)

    const supabase = await createClient()

    // Calculate total_amount server-side to prevent price tampering
    const { data: pricing } = await supabase
      .from('room_package_pricing')
      .select('price_override, packages(price_per_person)')
      .eq('room_type_id', data.room_type_id)
      .eq('package_id', data.package_id)
      .single()

    // Validate dates
    if (data.check_in_date && data.check_out_date && data.check_out_date <= data.check_in_date) {
      return NextResponse.json({ error: 'Check-out date must be after check-in date' }, { status: 400 })
    }

    // Validate guest count against room capacity
    // Validate total cabin capacity fits guests
    if (data.cabins.length > 0) {
      const cabinIds = data.cabins.map(c => c.room_type_id)
      const { data: cabinRooms } = await supabase
        .from('room_types')
        .select('id, max_occupancy')
        .in('id', cabinIds)
      const totalCapacity = (cabinRooms ?? []).reduce((sum, r) => sum + r.max_occupancy, 0)
      if (data.num_guests > totalCapacity) {
        return NextResponse.json({ error: `Selected cabins fit a maximum of ${totalCapacity} guests` }, { status: 400 })
      }
    }

    const basePrice = (pricing?.price_override ?? (pricing?.packages as { price_per_person: number } | null)?.price_per_person ?? 0)
    const addOnsTotal = data.add_ons.reduce((sum, a) => sum + a.price, 0)

    // Calculate nights from dates
    const isDayTrip = data.check_in_date === data.check_out_date
    const nights = isDayTrip ? 0 : Math.max(1, Math.round(
      (new Date(data.check_out_date).getTime() - new Date(data.check_in_date).getTime()) / 86400000
    ))
    const multiplier = isDayTrip ? 1 : nights

    const subtotal = (basePrice * multiplier * data.num_guests) + addOnsTotal

    // Validate promo code if provided
    let promoCodeId: string | null = null
    let discountAmount = 0

    if (data.promo_code) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('id, discount_type, discount_value, max_uses, uses_count, expires_at')
        .ilike('code', data.promo_code.trim())
        .eq('is_active', true)
        .single()

      if (promo) {
        const notExpired = !promo.expires_at || new Date(promo.expires_at) >= new Date()
        const withinLimit = promo.max_uses === null || promo.uses_count < promo.max_uses

        if (notExpired && withinLimit) {
          promoCodeId = promo.id
          if (promo.discount_type === 'percent') {
            discountAmount = Math.round(subtotal * promo.discount_value / 100 * 100) / 100
          } else if (promo.discount_type === 'fixed') {
            discountAmount = Math.min(promo.discount_value, subtotal)
          }
          // Increment uses_count
          await supabase
            .from('promo_codes')
            .update({ uses_count: promo.uses_count + 1 })
            .eq('id', promo.id)
        }
      }
    }

    const calculatedTotal = subtotal - discountAmount

    const insertData: BookingInsert = {
      ...data,
      booking_ref: '',
      status: 'pending_payment',
      payment_method: data.payment_method,
      add_ons: data.add_ons as unknown as BookingInsert['add_ons'],
      cabins: data.cabins as unknown as BookingInsert['cabins'],
      total_amount: calculatedTotal,
      promo_code_id: promoCodeId,
      discount_amount: discountAmount,
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(insertData)
      .select(`
        *,
        room_type:room_types(name),
        package:packages(name)
      `)
      .single()

    if (error) {
      console.error('Booking insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send emails (non-blocking)
    const bookingWithRelations = booking as Parameters<typeof sendBookingConfirmationEmail>[0]
    sendBookingConfirmationEmail(bookingWithRelations).catch(console.error)
    sendAdminNewBookingNotification(bookingWithRelations).catch(console.error)

    // Create Stripe Checkout Session if paying by card
    let checkoutUrl: string | null = null

    if (data.payment_method === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        currency: 'myr',
        customer_email: data.customer_email,
        line_items: [{
          price_data: {
            currency: 'myr',
            product_data: {
              name: `Dive Booking ${booking.booking_ref}`,
              description: [
                booking.room_type?.name,
                booking.package?.name,
                `${data.num_guests} guest${data.num_guests > 1 ? 's' : ''}`,
              ].filter(Boolean).join(' — '),
            },
            unit_amount: Math.round(calculatedTotal * 100),
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
      checkoutUrl = session.url
    }

    return NextResponse.json({ booking, checkoutUrl }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 })
    }
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
