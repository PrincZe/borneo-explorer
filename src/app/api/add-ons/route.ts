import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: add_ons, error } = await supabase
    .from('add_on_options')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ add_ons })
}
