import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const blockSchema = z.object({
  room_type_id: z.string().uuid().nullable().optional(),
  start_date: z.string(),
  end_date: z.string(),
  reason: z.string().optional(),
})

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['company_admin', 'backend_team', 'ship_worker'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [blockedRes, auditRes] = await Promise.all([
    supabase
      .from('blocked_dates')
      .select('*, room_type:room_types(name)')
      .order('start_date', { ascending: true }),
    supabase
      .from('blocked_dates_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  if (blockedRes.error) return NextResponse.json({ error: blockedRes.error.message }, { status: 500 })
  return NextResponse.json({ blocked_dates: blockedRes.data, audit_logs: auditRes.data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['company_admin', 'backend_team'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const data = blockSchema.parse(body)

  // Check for confirmed/pending_verification bookings that overlap the date range
  let conflictQuery = supabase
    .from('bookings')
    .select('booking_ref, customer_name, check_in_date, check_out_date, room_type_id')
    .in('status', ['confirmed', 'pending_verification'])
    .lt('check_in_date', data.end_date)
    .gt('check_out_date', data.start_date)

  if (data.room_type_id) {
    conflictQuery = conflictQuery.eq('room_type_id', data.room_type_id)
  }

  const { data: conflicts } = await conflictQuery

  if (conflicts && conflicts.length > 0) {
    const refs = conflicts.map(b => b.booking_ref).join(', ')
    return NextResponse.json(
      { error: `Cannot block these dates — ${conflicts.length} active booking(s) exist in this period: ${refs}` },
      { status: 409 }
    )
  }

  // Resolve room type name for audit log
  let roomTypeName = 'All Cabins'
  if (data.room_type_id) {
    const { data: room } = await supabase
      .from('room_types')
      .select('name')
      .eq('id', data.room_type_id)
      .single()
    if (room) roomTypeName = room.name
  }

  const { data: blocked, error } = await supabase
    .from('blocked_dates')
    .insert({ ...data, blocked_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Write audit log
  await supabase.from('blocked_dates_audit_logs').insert({
    action: 'created',
    room_type_name: roomTypeName,
    start_date: data.start_date,
    end_date: data.end_date,
    reason: data.reason ?? null,
    performed_by: user.id,
    performed_by_name: profile.full_name ?? user.email ?? 'Unknown',
  })

  return NextResponse.json({ blocked_date: blocked }, { status: 201 })
}
