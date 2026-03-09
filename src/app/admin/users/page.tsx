'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Loader2, Shield, User, Anchor } from 'lucide-react'

type Profile = {
  id: string
  full_name: string | null
  role: 'company_admin' | 'backend_team' | 'ship_worker'
  created_at: string
  email?: string
}

const ROLE_OPTIONS = [
  { value: 'company_admin', label: 'Company Admin', icon: Shield, color: 'text-purple-600 bg-purple-50' },
  { value: 'backend_team', label: 'Backend Team', icon: User, color: 'text-blue-600 bg-blue-50' },
  { value: 'ship_worker', label: 'Ship Worker', icon: Anchor, color: 'text-green-600 bg-green-50' },
]

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updateMsg, setUpdateMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id ?? null)

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })

    setProfiles(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleRoleChange(profileId: string, newRole: string) {
    setUpdatingId(profileId)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole as Profile['role'] })
      .eq('id', profileId)

    if (error) {
      setUpdateMsg({ id: profileId, msg: 'Failed to update', ok: false })
    } else {
      setProfiles(prev =>
        prev.map(p => p.id === profileId ? { ...p, role: newRole as Profile['role'] } : p)
      )
      setUpdateMsg({ id: profileId, msg: 'Role updated', ok: true })
    }
    setUpdatingId(null)
    setTimeout(() => setUpdateMsg(null), 2500)
  }

  const getRoleOption = (role: string) =>
    ROLE_OPTIONS.find(r => r.value === role) ?? ROLE_OPTIONS[2]

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">Manage team member roles</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
        <strong>Note:</strong> To add new team members, create their account via the Supabase dashboard and they will appear here once they sign in.
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">{profiles.length} Team Member{profiles.length !== 1 ? 's' : ''}</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : profiles.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No users found</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {profiles.map(profile => {
              const roleOption = getRoleOption(profile.role)
              const RoleIcon = roleOption.icon
              const isCurrentUser = profile.id === currentUserId

              return (
                <div key={profile.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-600">
                        {(profile.full_name ?? 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {profile.full_name ?? 'Unnamed User'}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">You</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <RoleIcon className="w-3 h-3 text-gray-400" />
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleOption.color}`}>
                          {roleOption.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Added {new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {updateMsg?.id === profile.id && (
                      <span className={`text-xs ${updateMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
                        {updateMsg.msg}
                      </span>
                    )}

                    {updatingId === profile.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <select
                        value={profile.role}
                        onChange={e => handleRoleChange(profile.id, e.target.value)}
                        disabled={isCurrentUser}
                        className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {ROLE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Role descriptions */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Role Permissions</h2>
        <div className="space-y-3">
          {[
            {
              role: ROLE_OPTIONS[0],
              perms: 'Full access: manage bookings, block dates, and change user roles',
            },
            {
              role: ROLE_OPTIONS[1],
              perms: 'Can view and update bookings, block/unblock dates',
            },
            {
              role: ROLE_OPTIONS[2],
              perms: 'Read-only: view bookings and calendar',
            },
          ].map(({ role, perms }) => {
            const Icon = role.icon
            return (
              <div key={role.value} className="flex items-start gap-3 text-sm">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${role.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{role.label}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{perms}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
