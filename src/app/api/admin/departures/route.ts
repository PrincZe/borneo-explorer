import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toDateStr } from '@/lib/departures'

// Lists upcoming departures with confirmed-pax counts vs their minimum.
export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['company_admin', 'backend_team', 'ship_worker'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const today = toDateStr(new Date())

  const { data: departures, error } = await supabase
    .from('departures')
    .select(`
      id, departure_date, min_pax, transfer_mode, confirmed_at,
      package:packages(name, slug, nights)
    `)
    .gte('departure_date', today)
    .order('departure_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const departureIds = (departures ?? []).map(d => d.id)

  // Pull all non-cancelled bookings for these departures to tally pax
  const paxByDeparture: Record<string, { confirmed: number; pending: number }> = {}
  if (departureIds.length > 0) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('departure_id, num_guests, status')
      .in('departure_id', departureIds)
      .neq('status', 'cancelled')

    for (const b of bookings ?? []) {
      if (!b.departure_id) continue
      const bucket = paxByDeparture[b.departure_id] ?? { confirmed: 0, pending: 0 }
      if (b.status === 'confirmed') bucket.confirmed += b.num_guests
      else bucket.pending += b.num_guests
      paxByDeparture[b.departure_id] = bucket
    }
  }

  const result = (departures ?? []).map(d => ({
    ...d,
    confirmed_pax: paxByDeparture[d.id]?.confirmed ?? 0,
    pending_pax: paxByDeparture[d.id]?.pending ?? 0,
  }))

  return NextResponse.json({ departures: result })
}
