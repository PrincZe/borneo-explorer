import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendBookingConfirmationEmail } from '@/lib/email'
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
  special_requests: z.string().optional(),
  // total_amount is calculated server-side — client value ignored
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

    const basePrice = (pricing?.price_override ?? (pricing?.packages as { price_per_person: number } | null)?.price_per_person ?? 0)
    const addOnsTotal = data.add_ons.reduce((sum, a) => sum + a.price, 0)
    const calculatedTotal = (basePrice * data.num_guests) + addOnsTotal

    const insertData: BookingInsert = {
      ...data,
      booking_ref: '',
      status: 'pending_payment',
      payment_method: 'bank_transfer',
      add_ons: data.add_ons as unknown as BookingInsert['add_ons'],
      total_amount: calculatedTotal,
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

    // Send confirmation email (non-blocking)
    sendBookingConfirmationEmail(booking as Parameters<typeof sendBookingConfirmationEmail>[0]).catch(console.error)

    return NextResponse.json({ booking }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 })
    }
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
