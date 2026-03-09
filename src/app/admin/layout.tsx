import { createClient } from '@/lib/supabase/server'
import AdminSidebar from './AdminSidebar'
import type { Profile } from '@/types/database'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Login page: render without sidebar
  if (!user) {
    return <>{children}</>
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const profile = profileData as Pick<Profile, 'full_name' | 'role'> | null

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar
        userEmail={user.email ?? ''}
        userRole={profile?.role ?? 'ship_worker'}
        userName={profile?.full_name ?? ''}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
