'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Users2, ToggleLeft, ToggleRight, Loader2, Copy, Check } from 'lucide-react'

type Affiliate = {
  id: string
  name: string
  email: string
  commission_rate: number
  is_active: boolean
  notes: string | null
  created_at: string
  promo_codes: { id: string; code: string; is_active: boolean; uses_count: number }[]
}

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', commission_rate: 10, notes: '' })
  const [error, setError] = useState('')

  const fetchAffiliates = useCallback(async () => {
    const res = await fetch('/api/admin/affiliates')
    const data = await res.json()
    setAffiliates(data.affiliates ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAffiliates() }, [fetchAffiliates])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/admin/affiliates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', email: '', commission_rate: 10, notes: '' })
      fetchAffiliates()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to create affiliate')
    }
    setSubmitting(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/affiliates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    fetchAffiliates()
  }

  function copyLink(code: string) {
    const url = `${window.location.origin}?ref=${code}`
    navigator.clipboard.writeText(url)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliates</h1>
          <p className="text-sm text-gray-500 mt-1">Manage affiliate partners and their promo codes</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Affiliate
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">New Affiliate</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Tan"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="john@agency.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Commission Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.commission_rate}
                  onChange={e => setForm(f => ({ ...f, commission_rate: parseFloat(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
                <input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optional notes"
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/80 disabled:opacity-50">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Affiliate
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Users2 className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">{affiliates.length} Affiliate{affiliates.length !== 1 ? 's' : ''}</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : affiliates.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No affiliates yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {affiliates.map(aff => (
              <div key={aff.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/admin/affiliates/${aff.id}`} className="font-semibold text-gray-900 hover:text-primary">
                        {aff.name}
                      </Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${aff.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {aff.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">{aff.email} · {aff.commission_rate}% commission</div>
                    {aff.notes && <div className="text-xs text-gray-400 mt-1">{aff.notes}</div>}

                    {/* Promo codes */}
                    {aff.promo_codes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {aff.promo_codes.map(code => (
                          <div key={code.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
                            <span className={`font-mono text-xs font-bold ${code.is_active ? 'text-primary' : 'text-gray-400 line-through'}`}>
                              {code.code}
                            </span>
                            <span className="text-xs text-gray-400">{code.uses_count} uses</span>
                            <button
                              onClick={() => copyLink(code.code)}
                              className="ml-1 text-gray-400 hover:text-primary transition-colors"
                              title="Copy affiliate link"
                            >
                              {copied === code.code ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/admin/affiliates/${aff.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Manage →
                    </Link>
                    <button onClick={() => toggleActive(aff.id, aff.is_active)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      {aff.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
