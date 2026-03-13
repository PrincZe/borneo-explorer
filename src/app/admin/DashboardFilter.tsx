'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function DashboardFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('month') ?? ''

  // Build 12 months back + 18 months forward
  const months: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = -18; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    months.push({ value, label })
  }
  // Sort chronologically descending (future first)
  months.sort((a, b) => b.value.localeCompare(a.value))

  function handleChange(value: string) {
    const params = new URLSearchParams()
    if (value) params.set('month', value)
    router.push(`/admin?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={current}
        onChange={e => handleChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
      >
        <option value="">All time</option>
        {months.map(m => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
      {current && (
        <button
          onClick={() => handleChange('')}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Clear
        </button>
      )}
    </div>
  )
}
