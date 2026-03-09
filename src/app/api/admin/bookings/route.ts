import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['company_admin', 'backend_team', 'ship_worker'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  let query = supabase
    .from('bookings')
    .select(`
      *,
      room_type:room_types(id, name, slug),
      package:packages(id, name, slug)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status as 'pending_payment' | 'pending_verification' | 'confirmed' | 'cancelled')
  }

  if (search) {
    // Limit search length and strip special chars to prevent abuse
    const safeSearch = search.slice(0, 100).replace(/[%_\\]/g, '\\$&')
    query = query.or(`customer_name.ilike.%${safeSearch}%,customer_email.ilike.%${safeSearch}%,booking_ref.ilike.%${safeSearch}%`)
  }

  const { data: bookings, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bookings, total: count, page, limit })
}
