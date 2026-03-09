import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end dates are required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Get all active room types
  const { data: rooms, error: roomsError } = await supabase
    .from('room_types')
    .select('*, room_package_pricing(*, packages(*))')
    .eq('is_active', true)

  if (roomsError) {
    return NextResponse.json({ error: roomsError.message }, { status: 500 })
  }

  // Get blocked date ranges that overlap with the requested range
  const { data: blockedDates } = await supabase
    .from('blocked_dates')
    .select('room_type_id, start_date, end_date')
    .lte('start_date', end)
    .gte('end_date', start)

  // Get confirmed/pending bookings that overlap
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('room_type_id, check_in_date, check_out_date, status')
    .in('status', ['pending_payment', 'pending_verification', 'confirmed'])
    .lte('check_in_date', end)
    .gte('check_out_date', start)

  // Determine availability for each room
  const availableRooms = rooms?.map(room => {
    const isGloballyBlocked = blockedDates?.some(
      b => b.room_type_id === null
    )
    const isRoomBlocked = blockedDates?.some(
      b => b.room_type_id === room.id
    )
    const hasBookingConflict = existingBookings?.some(
      b => b.room_type_id === room.id
    )

    return {
      ...room,
      available: !isGloballyBlocked && !isRoomBlocked && !hasBookingConflict,
    }
  })

  return NextResponse.json({ rooms: availableRooms })
}
