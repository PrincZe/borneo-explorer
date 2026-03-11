'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, ClipboardList, Calendar, Ban, Users, Ship, LogOut, ChevronRight, Users2
} from 'lucide-react'

interface Props {
  userEmail: string
  userRole: string
  userName: string
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['company_admin', 'backend_team', 'ship_worker'] },
  { href: '/admin/bookings', label: 'Bookings', icon: ClipboardList, roles: ['company_admin', 'backend_team', 'ship_worker'] },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar, roles: ['company_admin', 'backend_team', 'ship_worker'] },
  { href: '/admin/block-dates', label: 'Block Dates', icon: Ban, roles: ['company_admin', 'backend_team'] },
  { href: '/admin/affiliates', label: 'Affiliates', icon: Users2, roles: ['company_admin', 'backend_team'] },
  { href: '/admin/users', label: 'Users', icon: Users, roles: ['company_admin'] },
]

const roleLabels: Record<string, string> = {
  company_admin: 'Company Admin',
  backend_team: 'Backend Team',
  ship_worker: 'Ship Worker',
}

export default function AdminSidebar({ userEmail, userRole, userName }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const visibleItems = navItems.filter(item => item.roles.includes(userRole))

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Ship className="w-6 h-6 text-accent" />
          <div>
            <div className="font-bold text-sm">Celebes Explorer</div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-gray-800">
        <div className="px-3 py-2 mb-2">
          <div className="text-sm font-medium text-white truncate">{userName || userEmail}</div>
          <div className="text-xs text-gray-400">{roleLabels[userRole] ?? userRole}</div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
