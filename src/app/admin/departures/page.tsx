'use client'

import { useState, useEffect, useCallback } from 'react'
import { Ship, Waves, Loader2 } from 'lucide-react'

type Departure = {
  id: string
  departure_date: string
  min_pax: number
  transfer_mode: 'big_boat' | 'speedboat' | null
  confirmed_at: string | null
  package: { name: string; slug: string; nights: number | null } | null
  confirmed_pax: number
  pending_pax: number
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminDeparturesPage() {
  const [departures, setDepartures] = useState<Departure[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchDepartures = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/departures')
    const data = await res.json()
    setDepartures(data.departures ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchDepartures() }, [fetchDepartures])

  async function patchDeparture(id: string, payload: Record<string, unknown>, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setBusyId(id)
    const res = await fetch(`/api/admin/departures/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? 'Update failed')
    } else {
      await fetchDepartures()
    }
    setBusyId(null)
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Departures</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upcoming departures. Confirm whether each sails on the liveaboard or transfers by speedboat — confirming emails every guest on that date.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : departures.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No upcoming departures with bookings yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {departures.map(d => {
              const thresholdMet = d.confirmed_pax >= d.min_pax
              const isBusy = busyId === d.id
              return (
                <div key={d.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{fmtDate(d.departure_date)}</span>
                      <span className="text-xs text-gray-500">{d.package?.name ?? '—'}</span>
                      {d.transfer_mode === 'big_boat' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">Liveaboard</span>
                      )}
                      {d.transfer_mode === 'speedboat' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">Speedboat</span>
                      )}
                      {d.transfer_mode === null && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">Awaiting confirmation</span>
                      )}
                    </div>
                    <div className="text-sm mt-1 flex items-center gap-3">
                      <span className={thresholdMet ? 'text-green-700 font-medium' : 'text-gray-600'}>
                        {d.confirmed_pax} / {d.min_pax} pax confirmed
                        {thresholdMet ? ' ✓ threshold met' : ` (${d.min_pax - d.confirmed_pax} short)`}
                      </span>
                      {d.pending_pax > 0 && (
                        <span className="text-xs text-gray-400">+{d.pending_pax} pending payment</span>
                      )}
                    </div>
                    <label className="text-xs text-gray-400 mt-1 inline-flex items-center gap-1">
                      Min pax:
                      <input
                        type="number"
                        min={0}
                        defaultValue={d.min_pax}
                        disabled={isBusy}
                        onBlur={e => {
                          const v = parseInt(e.target.value)
                          if (!isNaN(v) && v !== d.min_pax) patchDeparture(d.id, { min_pax: v })
                        }}
                        className="w-16 border border-gray-200 rounded px-2 py-0.5 text-gray-700"
                      />
                    </label>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      disabled={isBusy}
                      onClick={() => patchDeparture(d.id, { transfer_mode: 'big_boat' },
                        `Confirm the LIVEABOARD sails on ${fmtDate(d.departure_date)}? This emails all guests on this departure.`)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        d.transfer_mode === 'big_boat'
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ship className="w-4 h-4" />}
                      Liveaboard
                    </button>
                    <button
                      disabled={isBusy}
                      onClick={() => patchDeparture(d.id, { transfer_mode: 'speedboat' },
                        `Confirm SPEEDBOAT transfer on ${fmtDate(d.departure_date)}? This emails all guests on this departure.`)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        d.transfer_mode === 'speedboat'
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Waves className="w-4 h-4" />}
                      Speedboat
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
