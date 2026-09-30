import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendDepartureTransferEmail } from '@/lib/email'
import type { Booking, Database } from '@/types/database'

type DepartureUpdate = Database['public']['Tables']['departures']['Update']

const updateSchema = z.object({
  transfer_mode: z.enum(['big_boat', 'speedboat']).optional(),
  min_pax: z.number().int().min(0).max(100).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['company_admin', 'backend_team'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const updates = updateSchema.parse(body)

  const { data: current } = await supabase
    .from('departures')
    .select('transfer_mode')
    .eq('id', id)
    .single()

  const updateData: DepartureUpdate = {}
  if (updates.min_pax !== undefined) updateData.min_pax = updates.min_pax
  if (updates.transfer_mode !== undefined) {
    updateData.transfer_mode = updates.transfer_mode
    updateData.confirmed_at = new Date().toISOString()
    updateData.confirmed_by = user.id
  }

  const { data: departure, error } = await supabase
    .from('departures')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // On a (re)confirmation of transfer mode, notify every active booking on the departure
  if (updates.transfer_mode !== undefined && updates.transfer_mode !== current?.transfer_mode) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('departure_id', id)
      .neq('status', 'cancelled')

    for (const b of (bookings ?? []) as Booking[]) {
      sendDepartureTransferEmail(b, updates.transfer_mode).catch(console.error)
    }
  }

  return NextResponse.json({ departure })
}
