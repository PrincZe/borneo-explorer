'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Check } from 'lucide-react'

export default function AccountPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nameMsg, setNameMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? '')
    })
    supabase.from('profiles').select('full_name').single().then(({ data }) => {
      if (data) setName(data.full_name ?? '')
    })
  }, [])

  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault()
    setSavingName(true)
    setNameMsg(null)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', (await supabase.auth.getUser()).data.user!.id)
    setNameMsg(error ? { text: 'Failed to update name', ok: false } : { text: 'Name updated', ok: true })
    setSavingName(false)
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg(null)
    if (password !== confirmPassword) {
      setPasswordMsg({ text: 'Passwords do not match', ok: false })
      return
    }
    if (password.length < 8) {
      setPasswordMsg({ text: 'Password must be at least 8 characters', ok: false })
      return
    }
    setSavingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setPasswordMsg({ text: error.message, ok: false })
    } else {
      setPasswordMsg({ text: 'Password updated successfully', ok: true })
      setPassword('')
      setConfirmPassword('')
    }
    setSavingPassword(false)
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">{email}</p>
      </div>

      {/* Display name */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Display Name</h2>
        <form onSubmit={handleNameSave} className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {nameMsg && (
            <p className={`text-sm flex items-center gap-1.5 ${nameMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
              {nameMsg.ok && <Check className="w-4 h-4" />}{nameMsg.text}
            </p>
          )}
          <button type="submit" disabled={savingName}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/80 disabled:opacity-50">
            {savingName && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Name
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {passwordMsg && (
            <p className={`text-sm flex items-center gap-1.5 ${passwordMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
              {passwordMsg.ok && <Check className="w-4 h-4" />}{passwordMsg.text}
            </p>
          )}
          <button type="submit" disabled={savingPassword || !password}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/80 disabled:opacity-50">
            {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
