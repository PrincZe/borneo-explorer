import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('promo_codes')
    .select('id, code, discount_type, discount_value, max_uses, uses_count, expires_at, affiliates(name)')
    .ilike('code', code.trim())
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ valid: false, error: 'Invalid or inactive promo code' }, { status: 404 })
  }

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: 'This promo code has expired' }, { status: 400 })
  }

  // Check max uses
  if (data.max_uses !== null && data.uses_count >= data.max_uses) {
    return NextResponse.json({ valid: false, error: 'This promo code has reached its usage limit' }, { status: 400 })
  }

  const affiliate = data.affiliates as { name: string } | null

  return NextResponse.json({
    valid: true,
    id: data.id,
    code: data.code,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    affiliate_name: affiliate?.name ?? null,
  })
}
