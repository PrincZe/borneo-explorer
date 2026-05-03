import { createClient } from '@/lib/supabase/server'
import AccountHeader from './AccountHeader'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Auth/signup pages: no chrome
  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <AccountHeader
        userEmail={user.email ?? ''}
        userName={profile?.full_name ?? ''}
      />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
