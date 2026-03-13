import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

async function requireCompanyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'company_admin') return null
  return user
}

export async function GET() {
  if (!await requireCompanyAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = getAdminClient()

  // Fetch all auth users (includes emails)
  const { data: { users: authUsers }, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch all profiles
  const { data: profiles } = await admin.from('profiles').select('*').order('created_at', { ascending: true })

  // Merge email into profiles
  const emailMap = Object.fromEntries(authUsers.map(u => [u.id, u.email]))
  const merged = (profiles ?? []).map(p => ({ ...p, email: emailMap[p.id] ?? null }))

  return NextResponse.json({ users: merged })
}

const createSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['company_admin', 'backend_team', 'ship_worker']),
})

export async function POST(request: NextRequest) {
  if (!await requireCompanyAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const data = createSchema.parse(body)

  const admin = getAdminClient()

  // Create the auth user (email already confirmed, no verification needed)
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: { full_name: data.full_name },
  })

  if (createError) {
    if (createError.message.includes('already registered')) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  // The on_auth_user_created trigger creates the profile — update its role
  const { error: profileError } = await admin
    .from('profiles')
    .update({ role: data.role, full_name: data.full_name })
    .eq('id', created.user.id)

  if (profileError) {
    // User was created but profile update failed — still return success
    console.error('Profile role update failed:', profileError)
  }

  return NextResponse.json({ user: { id: created.user.id, email: data.email, full_name: data.full_name, role: data.role } }, { status: 201 })
}
