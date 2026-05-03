import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAdminPath = path.startsWith('/admin')
  const isAdminLogin = path === '/admin/login'
  const isAccountPath = path.startsWith('/account')
  const isAccountLogin = path === '/account/login'
  const isAccountSignup = path === '/account/signup'

  // --- Admin guard ---
  if (isAdminPath && !isAdminLogin) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['company_admin', 'backend_team', 'ship_worker'].includes(profile.role)) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // --- Customer account guard ---
  if (isAccountPath && !isAccountLogin && !isAccountSignup) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/account/login'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Admin users trying to access /account: redirect to admin panel
    if (profile && ['company_admin', 'backend_team', 'ship_worker'].includes(profile.role)) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    // No profile or not a customer
    if (!profile || profile.role !== 'customer') {
      const url = request.nextUrl.clone()
      url.pathname = '/account/login'
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in customers away from login/signup
  if ((isAccountLogin || isAccountSignup) && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'customer') {
      const url = request.nextUrl.clone()
      url.pathname = '/account'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
