'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Loader2, Shield, User, Anchor, Plus, Eye, EyeOff } from 'lucide-react'

type Profile = {
  id: string
  full_name: string | null
  role: 'company_admin' | 'backend_team' | 'ship_worker'
  created_at: string
  email?: string | null
}

const ROLE_OPTIONS = [
  { value: 'company_admin', label: 'Company Admin', icon: Shield, color: 'text-purple-600 bg-purple-50' },
  { value: 'backend_team', label: 'Backend Team', icon: User, color: 'text-blue-600 bg-blue-50' },
  { value: 'ship_worker', label: 'Ship Worker', icon: Anchor, color: 'text-green-600 bg-green-50' },
]

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updateMsg, setUpdateMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'backend_team' as Profile['role'] })

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setProfiles(data.users ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleRoleChange(profileId: string, newRole: string) {
    setUpdatingId(profileId)
    const res = await fetch(`/api/admin/users/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role: newRole as Profile['role'] } : p))
      setUpdateMsg({ id: profileId, msg: 'Role updated', ok: true })
    } else {
      setUpdateMsg({ id: profileId, msg: 'Failed to update', ok: false })
    }
    setUpdatingId(null)
    setTimeout(() => setUpdateMsg(null), 2500)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ full_name: '', email: '', password: '', role: 'backend_team' })
      fetchUsers()
    } else {
      const data = await res.json()
      setFormError(data.error ?? 'Failed to create user')
    }
    setSubmitting(false)
  }

  const getRoleOption = (role: string) => ROLE_OPTIONS.find(r => r.value === role) ?? ROLE_OPTIONS[2]

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team member accounts and roles</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/80 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">New Team Member</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
                <input
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  required
                  placeholder="Jane Smith"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="jane@company.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Temporary Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as Profile['role'] }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {ROLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <p className="text-xs text-gray-400">The user can log in immediately with these credentials and change their password from their account settings.</p>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/80 disabled:opacity-50">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create User
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User list */}
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

              return (
                <div key={profile.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-600">
                        {(profile.full_name ?? profile.email ?? 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {profile.full_name ?? 'Unnamed User'}
                      </div>
                      <div className="text-xs text-gray-400 truncate">{profile.email}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <RoleIcon className="w-3 h-3 text-gray-400" />
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleOption.color}`}>
                          {roleOption.label}
                        </span>
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
                        className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
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
            { role: ROLE_OPTIONS[0], perms: 'Full access: manage bookings, block dates, manage users and affiliates' },
            { role: ROLE_OPTIONS[1], perms: 'Can view and update bookings, block/unblock dates, manage affiliates' },
            { role: ROLE_OPTIONS[2], perms: 'Read-only: view bookings and calendar' },
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
