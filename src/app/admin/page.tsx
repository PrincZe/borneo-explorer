import { createClient } from '@/lib/supabase/server'
import type { Booking } from '@/types/database'
import Link from 'next/link'
import { Suspense } from 'react'
import { ClipboardList, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp } from 'lucide-react'
import DashboardFilter from './DashboardFilter'

type BookingStat = Pick<Booking, 'status' | 'total_amount' | 'created_at' | 'check_in_date'>
type RecentBooking = Pick<Booking, 'id' | 'booking_ref' | 'customer_name' | 'status' | 'total_amount' | 'created_at'> & {
  room_type: { name: string } | null
  package: { name: string } | null
}

interface Props {
  searchParams: Promise<{ month?: string }>
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-800',
    pending_verification: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  const labels: Record<string, string> = {
    pending_payment: 'Pending Payment',
    pending_verification: 'Pending Verification',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
  }
  return { cls: map[status] ?? 'bg-gray-100 text-gray-800', label: labels[status] ?? status }
}

export default async function AdminDashboard({ searchParams }: Props) {
  const { month } = await searchParams
  const supabase = await createClient()

  // Fetch all bookings for monthly breakdown + stats
  const { data: bookingsRaw } = await supabase
    .from('bookings')
    .select('status, total_amount, created_at, check_in_date')
    .order('created_at', { ascending: false })

  const allBookings = (bookingsRaw ?? []) as BookingStat[]

  // Filter to selected month if set (based on check_in_date)
  const filtered = month
    ? allBookings.filter(b => b.check_in_date?.startsWith(month))
    : allBookings

  const total = filtered.length
  const pending_payment = filtered.filter(b => b.status === 'pending_payment').length
  const pending_verification = filtered.filter(b => b.status === 'pending_verification').length
  const confirmed = filtered.filter(b => b.status === 'confirmed').length
  const cancelled = filtered.filter(b => b.status === 'cancelled').length
  const totalRevenue = filtered
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.total_amount ?? 0), 0)

  // Monthly breakdown — group by check_in_date month, last 12 months
  const monthMap: Record<string, { bookings: number; revenue: number; confirmed: number }> = {}
  for (const b of allBookings) {
    if (!b.check_in_date) continue
    const key = b.check_in_date.slice(0, 7) // "YYYY-MM"
    if (!monthMap[key]) monthMap[key] = { bookings: 0, revenue: 0, confirmed: 0 }
    monthMap[key].bookings++
    if (b.status === 'confirmed') {
      monthMap[key].confirmed++
      monthMap[key].revenue += b.total_amount ?? 0
    }
  }

  // Build 12 months back + 18 months forward, sorted descending (future first)
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthRows = []
  for (let i = -18; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    monthRows.push({ key, label, ...(monthMap[key] ?? { bookings: 0, revenue: 0, confirmed: 0 }) })
  }
  // Only show months with bookings + the next 3 future months always visible
  const upcomingKeys = new Set(
    Array.from({ length: 3 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })
  )
  const visibleMonthRows = monthRows.filter(r => r.bookings > 0 || r.key === currentMonthKey || upcomingKeys.has(r.key))
  const maxBookings = Math.max(...visibleMonthRows.map(m => m.bookings), 1)

  // Recent bookings filtered to selected month
  let recentQuery = supabase
    .from('bookings')
    .select(`id, booking_ref, customer_name, status, total_amount, created_at, room_type:room_types(name), package:packages(name)`)
    .order('created_at', { ascending: false })
    .limit(month ? 50 : 5)

  if (month) {
    const [y, m] = month.split('-').map(Number)
    const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
    recentQuery = recentQuery.gte('check_in_date', `${month}-01`).lt('check_in_date', `${nextMonth}-01`)
  }

  const { data: recentBookingsRaw } = await recentQuery
  const recentBookings = (recentBookingsRaw ?? []) as RecentBooking[]
  const displayBookings = month ? recentBookings : recentBookings.slice(0, 5)

  const selectedLabel = month
    ? new Date(month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {selectedLabel ? `Showing bookings with check-in in ${selectedLabel}` : 'Overview of all bookings and revenue'}
          </p>
        </div>
        <Suspense fallback={null}>
          <DashboardFilter />
        </Suspense>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Total Bookings</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{total}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Confirmed Revenue</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">SGD {totalRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Needs Attention</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{pending_verification}</div>
          <p className="text-xs text-gray-400 mt-1">awaiting verification</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Pending Payment</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{pending_payment}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Confirmed</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{confirmed}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Cancelled</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{cancelled}</div>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Bookings by Month (check-in date)</h2>
          <p className="text-xs text-gray-400 mt-0.5">Past &amp; future — click any month to filter the stats above</p>
        </div>
        <div className="divide-y divide-gray-50">
          {visibleMonthRows.map(row => {
            const isCurrentMonth = row.key === currentMonthKey
            const isFuture = row.key > currentMonthKey
            return (
              <Link
                key={row.key}
                href={`/admin?month=${row.key}`}
                className={`flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors ${month === row.key ? 'bg-primary/5' : ''}`}
              >
                <div className="w-36 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-medium ${isCurrentMonth ? 'text-primary' : 'text-gray-700'}`}>
                      {row.label}
                    </span>
                    {isCurrentMonth && (
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Now</span>
                    )}
                    {isFuture && row.bookings === 0 && (
                      <span className="text-xs text-gray-300">upcoming</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isFuture ? 'bg-accent/70' : 'bg-primary'}`}
                    style={{ width: `${(row.bookings / maxBookings) * 100}%` }}
                  />
                </div>
                <div className="w-6 text-sm font-bold text-gray-900 text-right flex-shrink-0">{row.bookings}</div>
                <div className="w-28 text-xs text-gray-400 text-right flex-shrink-0">
                  {row.confirmed > 0 ? `SGD ${row.revenue.toLocaleString()}` : '—'}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent / filtered bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {selectedLabel ? `Bookings in ${selectedLabel}` : 'Recent Bookings'}
          </h2>
          <Link href="/admin/bookings" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {displayBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            {selectedLabel ? `No bookings with check-in in ${selectedLabel}` : 'No bookings yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {displayBookings.map((booking) => {
              const { cls, label } = statusBadge(booking.status)
              return (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">{booking.booking_ref}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-0.5 truncate">{booking.customer_name}</div>
                    <div className="text-xs text-gray-400">
                      {(booking.room_type as { name: string } | null)?.name} ·{' '}
                      {(booking.package as { name: string } | null)?.name}
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    {booking.total_amount && (
                      <div className="text-sm font-semibold text-gray-900">
                        SGD {booking.total_amount.toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(booking.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
