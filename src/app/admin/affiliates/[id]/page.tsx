'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, ToggleLeft, ToggleRight, Copy, Check, Loader2, TrendingUp, Ticket } from 'lucide-react'

type PromoCode = {
  id: string
  code: string
  discount_type: 'percent' | 'fixed' | 'none'
  discount_value: number
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_active: boolean
}

type Affiliate = {
  id: string
  name: string
  email: string
  commission_rate: number
  is_active: boolean
  notes: string | null
  promo_codes: PromoCode[]
}

export default function AffiliateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [totalBookings, setTotalBookings] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCodeForm, setShowCodeForm] = useState(false)
  const [codeSubmitting, setCodeSubmitting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [codeError, setCodeError] = useState('')
  const [codeForm, setCodeForm] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed' | 'none',
    discount_value: 5,
    max_uses: '',
    expiry_preset: 'never' as 'never' | '7d' | '30d' | '90d' | 'custom',
    expires_at: '',
  })

  function getExpiryDate(preset: string, custom: string): string | null {
    if (preset === 'never') return null
    if (preset === 'custom') return custom || null
    const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  }

  function expiryLabel(expires_at: string | null): { text: string; color: string } {
    if (!expires_at) return { text: 'Never expires', color: 'text-gray-400' }
    const diff = Math.ceil((new Date(expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { text: `Expired ${Math.abs(diff)}d ago`, color: 'text-red-500' }
    if (diff === 0) return { text: 'Expires today', color: 'text-orange-500' }
    if (diff <= 7) return { text: `Expires in ${diff}d`, color: 'text-orange-500' }
    return { text: `Expires in ${diff}d (${new Date(expires_at).toLocaleDateString('en-GB')})`, color: 'text-gray-400' }
  }

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/admin/affiliates/${id}`)
    if (!res.ok) { router.push('/admin/affiliates'); return }
    const data = await res.json()
    setAffiliate(data.affiliate)
    setTotalBookings(data.total_bookings)
    setTotalCommission(data.total_commission)
    setLoading(false)
  }, [id, router])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleCreateCode(e: React.FormEvent) {
    e.preventDefault()
    setCodeSubmitting(true)
    setCodeError('')
    const res = await fetch('/api/admin/promo-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: codeForm.code.toUpperCase(),
        affiliate_id: id,
        discount_type: codeForm.discount_type,
        discount_value: parseFloat(String(codeForm.discount_value)),
        max_uses: codeForm.max_uses ? parseInt(codeForm.max_uses) : null,
        expires_at: getExpiryDate(codeForm.expiry_preset, codeForm.expires_at),
      }),
    })
    if (res.ok) {
      setShowCodeForm(false)
      setCodeForm({ code: '', discount_type: 'percent', discount_value: 5, max_uses: '', expiry_preset: 'never', expires_at: '' })
      fetchData()
    } else {
      const data = await res.json()
      setCodeError(data.error ?? 'Failed to create code')
    }
    setCodeSubmitting(false)
  }

  async function toggleCode(codeId: string, current: boolean) {
    await fetch(`/api/admin/promo-codes/${codeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    fetchData()
  }

  function copyLink(code: string) {
    const url = `${window.location.origin}?ref=${code}`
    navigator.clipboard.writeText(url)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-64"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  if (!affiliate) return null

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/affiliates" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{affiliate.name}</h1>
          <p className="text-sm text-gray-500">{affiliate.email} · {affiliate.commission_rate}% commission</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <TrendingUp className="w-4 h-4" />
            Confirmed Bookings
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalBookings}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Total Commission
          </div>
          <div className="text-3xl font-bold text-gray-900">SGD {totalCommission.toLocaleString()}</div>
        </div>
      </div>

      {/* Promo codes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Promo Codes</h2>
          </div>
          <button
            onClick={() => setShowCodeForm(s => !s)}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Code
          </button>
        </div>

        {showCodeForm && (
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <form onSubmit={handleCreateCode} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Code *</label>
                  <input
                    value={codeForm.code}
                    onChange={e => setCodeForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    required
                    placeholder="e.g. JOHN2026"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Discount Type</label>
                  <select
                    value={codeForm.discount_type}
                    onChange={e => setCodeForm(f => ({ ...f, discount_type: e.target.value as 'percent' | 'fixed' | 'none' }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="percent">Percentage off</option>
                    <option value="fixed">Fixed amount off (SGD)</option>
                    <option value="none">No discount (tracking only)</option>
                  </select>
                </div>
                {codeForm.discount_type !== 'none' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                      {codeForm.discount_type === 'percent' ? 'Discount (%)' : 'Discount (SGD)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={codeForm.discount_value}
                      onChange={e => setCodeForm(f => ({ ...f, discount_value: parseFloat(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Max Uses (leave blank = unlimited)</label>
                  <input
                    type="number"
                    min={1}
                    value={codeForm.max_uses}
                    onChange={e => setCodeForm(f => ({ ...f, max_uses: e.target.value }))}
                    placeholder="Unlimited"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Expiry</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'never', label: 'Never expires' },
                      { value: '7d', label: '7 days' },
                      { value: '30d', label: '30 days' },
                      { value: '90d', label: '90 days' },
                      { value: 'custom', label: 'Custom date' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCodeForm(f => ({ ...f, expiry_preset: opt.value as typeof codeForm.expiry_preset }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          codeForm.expiry_preset === opt.value
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {codeForm.expiry_preset === 'custom' && (
                    <input
                      type="date"
                      value={codeForm.expires_at}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setCodeForm(f => ({ ...f, expires_at: e.target.value }))}
                      className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                  {codeForm.expiry_preset !== 'never' && codeForm.expiry_preset !== 'custom' && (
                    <p className="mt-1.5 text-xs text-gray-400">
                      Expires on {getExpiryDate(codeForm.expiry_preset, '')
                        ? new Date(getExpiryDate(codeForm.expiry_preset, '')!).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : ''}
                    </p>
                  )}
                </div>
              </div>
              {codeError && <p className="text-red-500 text-sm">{codeError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={codeSubmitting}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/80 disabled:opacity-50">
                  {codeSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Code
                </button>
                <button type="button" onClick={() => setShowCodeForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {affiliate.promo_codes.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No promo codes yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {affiliate.promo_codes.map(code => (
              <div key={code.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold text-sm ${code.is_active ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                      {code.code}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${code.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {code.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>
                      {code.discount_type === 'none' ? 'Tracking only' :
                        code.discount_type === 'percent' ? `${code.discount_value}% off` :
                        `SGD ${code.discount_value} off`}
                    </span>
                    <span>{code.uses_count}{code.max_uses ? `/${code.max_uses}` : ''} uses</span>
                    <span className={expiryLabel(code.expires_at).color}>
                      {expiryLabel(code.expires_at).text}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 font-mono">
                    {typeof window !== 'undefined' ? `${window.location.origin}?ref=${code.code}` : `/?ref=${code.code}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => copyLink(code.code)} className="text-gray-400 hover:text-primary transition-colors" title="Copy link">
                    {copied === code.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => toggleCode(code.id, code.is_active)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    {code.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
