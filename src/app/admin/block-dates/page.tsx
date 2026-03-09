'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Ban, Plus, Trash2, Loader2 } from 'lucide-react'

type RoomType = { id: string; name: string }
type BlockedDate = {
  id: string
  start_date: string
  end_date: string
  reason: string | null
  room_type_id: string | null
  room_type: { name: string } | null
  blocked_by: string | null
  created_at: string
}

export default function BlockDatesPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    room_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  })

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const [blockedRes, roomsRes] = await Promise.all([
      supabase
        .from('blocked_dates')
        .select('*, room_type:room_types(name)')
        .order('start_date', { ascending: true }),
      supabase
        .from('room_types')
        .select('id, name')
        .eq('is_active', true)
        .order('name'),
    ])
    setBlockedDates(blockedRes.data ?? [])
    setRoomTypes(roomsRes.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.start_date || !form.end_date) {
      setError('Start and end dates are required')
      return
    }
    if (form.start_date > form.end_date) {
      setError('End date must be after start date')
      return
    }

    setSubmitting(true)
    const res = await fetch('/api/admin/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_type_id: form.room_type_id || null,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason || undefined,
      }),
    })

    if (res.ok) {
      setSuccess('Dates blocked successfully')
      setForm({ room_type_id: '', start_date: '', end_date: '', reason: '' })
      fetchData()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to block dates')
    }
    setSubmitting(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/admin/blocked-dates/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setBlockedDates(prev => prev.filter(b => b.id !== id))
    }
    setDeletingId(null)
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Block Dates</h1>
        <p className="text-sm text-gray-500 mt-1">Block dates to prevent bookings for specific cabins or all cabins</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Block
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                End Date *
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Cabin (leave empty to block all)
            </label>
            <select
              value={form.room_type_id}
              onChange={e => setForm(f => ({ ...f, room_type_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Cabins (Global Block)</option>
              {roomTypes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Reason (optional)
            </label>
            <input
              type="text"
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="e.g. Maintenance, Charter, Public holiday"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/80 disabled:opacity-50 transition-colors"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <Ban className="w-4 h-4" />
            Block Dates
          </button>
        </form>
      </div>

      {/* Existing blocks */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Blocked Periods</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : blockedDates.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No blocked dates</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {blockedDates.map(block => (
              <div key={block.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">
                      {new Date(block.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' → '}
                      {new Date(block.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      block.room_type_id
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-orange-50 text-orange-700'
                    }`}>
                      {block.room_type ? block.room_type.name : 'All Cabins'}
                    </span>
                  </div>
                  {block.reason && (
                    <div className="text-gray-400 text-xs mt-0.5">{block.reason}</div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(block.id)}
                  disabled={deletingId === block.id}
                  className="ml-4 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                >
                  {deletingId === block.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
