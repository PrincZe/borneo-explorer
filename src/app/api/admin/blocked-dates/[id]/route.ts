import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  // Fetch block details before deleting (needed for audit log)
  const { data: block } = await supabase
    .from('blocked_dates')
    .select('*, room_type:room_types(name)')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Write audit log after successful delete
  if (block) {
    const roomTypeName = (block.room_type as { name: string } | null)?.name ?? 'All Cabins'
    await supabase.from('blocked_dates_audit_logs').insert({
      action: 'deleted',
      room_type_name: roomTypeName,
      start_date: block.start_date,
      end_date: block.end_date,
      reason: block.reason ?? null,
      performed_by: user.id,
      performed_by_name: profile.full_name ?? user.email ?? 'Unknown',
    })
  }

  return NextResponse.json({ success: true })
}
