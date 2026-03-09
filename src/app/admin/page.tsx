import { createClient } from '@/lib/supabase/server'
import type { Booking } from '@/types/database'
import Link from 'next/link'
import { ClipboardList, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp } from 'lucide-react'

type BookingStat = Pick<Booking, 'status' | 'total_amount' | 'created_at'>
type RecentBooking = Pick<Booking, 'id' | 'booking_ref' | 'customer_name' | 'status' | 'total_amount' | 'created_at'> & {
  room_type: { name: string } | null
  package: { name: string } | null
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch booking stats
  const { data: bookingsRaw } = await supabase
    .from('bookings')
    .select('status, total_amount, created_at')
    .order('created_at', { ascending: false })

  const bookings = (bookingsRaw ?? []) as BookingStat[]

  const total = bookings.length
  const pending_payment = bookings.filter(b => b.status === 'pending_payment').length
  const pending_verification = bookings.filter(b => b.status === 'pending_verification').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.total_amount ?? 0), 0)

  // Recent bookings (last 5)
  const { data: recentBookingsRaw } = await supabase
    .from('bookings')
    .select(`
      id, booking_ref, customer_name, status, total_amount, created_at,
      room_type:room_types(name),
      package:packages(name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const recentBookings = (recentBookingsRaw ?? []) as RecentBooking[]

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

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your bookings and revenue</p>
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

      {/* Recent bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No bookings yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentBookings.map((booking) => {
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
