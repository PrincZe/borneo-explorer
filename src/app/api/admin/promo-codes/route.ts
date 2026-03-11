import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const promoSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, numbers, hyphens, or underscores'),
  affiliate_id: z.string().uuid(),
  discount_type: z.enum(['percent', 'fixed', 'none']),
  discount_value: z.number().min(0),
  max_uses: z.number().int().positive().optional().nullable(),
  expires_at: z.string().optional().nullable(),
})

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['company_admin', 'backend_team'].includes(profile.role)) return null
  return user
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const data = promoSchema.parse(body)

  // Force code to uppercase
  const { data: promo, error } = await supabase
    .from('promo_codes')
    .insert({ ...data, code: data.code.toUpperCase() })
    .select('*, affiliates(name)')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Code already exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ promo_code: promo }, { status: 201 })
}
