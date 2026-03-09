'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type CalendarBooking = {
  id: string
  booking_ref: string
  customer_name: string
  status: string
  check_in_date: string
  check_out_date: string
  room_type: { name: string } | null
}

type BlockedDate = {
  id: string
  start_date: string
  end_date: string
  reason: string | null
  room_type_id: string | null
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-yellow-400',
  pending_verification: 'bg-blue-400',
  confirmed: 'bg-green-500',
  cancelled: 'bg-red-400',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function toDateStr(date: Date) {
  return date.toISOString().split('T')[0]
}

export default function AdminCalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [bookings, setBookings] = useState<CalendarBooking[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = createClient()

      const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${String(getDaysInMonth(year, month)).padStart(2, '0')}`

      const [bookingsRes, blockedRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('id, booking_ref, customer_name, status, check_in_date, check_out_date, room_type:room_types(name)')
          .in('status', ['pending_payment', 'pending_verification', 'confirmed'])
          .lte('check_in_date', endOfMonth)
          .gte('check_out_date', startOfMonth),
        supabase
          .from('blocked_dates')
          .select('id, start_date, end_date, reason, room_type_id')
          .lte('start_date', endOfMonth)
          .gte('end_date', startOfMonth),
      ])

      setBookings((bookingsRes.data as CalendarBooking[]) ?? [])
      setBlockedDates(blockedRes.data ?? [])
      setLoading(false)
    }
    fetchData()
  }, [year, month])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  function getBookingsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return bookings.filter(b =>
      b.check_in_date <= dateStr && b.check_out_date >= dateStr
    )
  }

  function isBlocked(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return blockedDates.some(b => b.start_date <= dateStr && b.end_date >= dateStr)
  }

  const isToday = (day: number) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate()

  // Build calendar grid
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Booking overview by month</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-900 min-w-[140px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {[
          { color: 'bg-green-500', label: 'Confirmed' },
          { color: 'bg-blue-400', label: 'Pending Verification' },
          { color: 'bg-yellow-400', label: 'Pending Payment' },
          { color: 'bg-gray-300', label: 'Blocked' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
          Loading calendar...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="min-h-[100px] bg-gray-50 border-b border-r border-gray-100 last:border-r-0" />
              }

              const dayBookings = getBookingsForDay(day)
              const blocked = isBlocked(day)
              const today = isToday(day)

              return (
                <div
                  key={day}
                  className={`min-h-[100px] border-b border-r border-gray-100 p-1.5 last:border-r-0 ${
                    blocked ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    today ? 'bg-primary text-white' : 'text-gray-700'
                  }`}>
                    {day}
                  </div>

                  {blocked && (
                    <div className="text-[10px] bg-gray-200 text-gray-600 rounded px-1 py-0.5 mb-0.5 truncate">
                      Blocked
                    </div>
                  )}

                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 3).map(booking => (
                      <Link
                        key={booking.id}
                        href={`/admin/bookings/${booking.id}`}
                        className={`block text-[10px] text-white rounded px-1 py-0.5 truncate hover:opacity-80 transition-opacity ${
                          STATUS_COLORS[booking.status] ?? 'bg-gray-400'
                        }`}
                        title={`${booking.customer_name} · ${booking.booking_ref}`}
                      >
                        {booking.customer_name}
                      </Link>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-[10px] text-gray-500 px-1">
                        +{dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* This month's bookings list */}
      {bookings.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">
              {MONTHS[month]} {year} — {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {bookings
              .sort((a, b) => a.check_in_date.localeCompare(b.check_in_date))
              .map(booking => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[booking.status] ?? 'bg-gray-400'}`} />
                    <div>
                      <span className="font-medium text-gray-900">{booking.customer_name}</span>
                      <span className="text-gray-400 text-xs ml-2">{booking.booking_ref}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(booking.check_in_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    {' → '}
                    {new Date(booking.check_out_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
