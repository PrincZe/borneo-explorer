import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, CheckCircle, XCircle, Upload, ChevronRight, Waves } from 'lucide-react'

const STATUS_CONFIG = {
  pending_payment: { label: 'Awaiting Payment', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  pending_verification: { label: 'Verifying Payment', color: 'bg-blue-100 text-blue-800', icon: Upload },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
} as const

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatCurrency(amount: number | null) {
  if (amount == null) return '—'
  return `SGD ${amount.toLocaleString('en-SG', { minimumFractionDigits: 0 })}`
}

function nightsCount(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 0
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export default async function AccountDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account/login')

  const [bookingsRes, loyaltyRes] = await Promise.all([
    supabase
      .from('bookings')
      .select(`
        id, booking_ref, status, check_in_date, check_out_date,
        num_guests, total_amount, created_at,
        room_types ( name ),
        packages ( name )
      `)
      .eq('customer_user_id', user.id)
      .order('check_in_date', { ascending: false }),

    supabase
      .from('customer_loyalty_nights')
      .select('confirmed_nights, total_bookings')
      .eq('customer_user_id', user.id)
      .maybeSingle(),
  ])

  const bookings = (bookingsRes.data ?? []) as Array<{
    id: string
    booking_ref: string
    status: keyof typeof STATUS_CONFIG
    check_in_date: string | null
    check_out_date: string | null
    num_guests: number
    total_amount: number | null
    created_at: string
    room_types: { name: string } | null
    packages: { name: string } | null
  }>

  const loyalty = loyaltyRes.data
  const confirmedNights = loyalty?.confirmed_nights ?? 0
  const totalBookings = loyalty?.total_bookings ?? 0

  const today = new Date().toISOString().split('T')[0]
  const upcoming = bookings.filter(b =>
    b.status !== 'cancelled' && (b.check_in_date ?? '') >= today
  )
  const past = bookings.filter(b =>
    b.status === 'cancelled' || (b.check_in_date ?? '') < today
  )

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Confirmed nights</p>
          <p className="text-3xl font-bold text-primary">{confirmedNights}</p>
          <p className="text-xs text-gray-400 mt-1">Nights dived with us</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total bookings</p>
          <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Upcoming trips</p>
          <p className="text-3xl font-bold text-gray-900">{upcoming.length}</p>
          <p className="text-xs text-gray-400 mt-1">Confirmed &amp; pending</p>
        </div>
      </div>

      {/* Upcoming bookings */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming trips</h2>
          <div className="space-y-3">
            {upcoming.map(booking => {
              const cfg = STATUS_CONFIG[booking.status]
              const Icon = cfg.icon
              const nights = nightsCount(booking.check_in_date, booking.check_out_date)
              return (
                <Link
                  key={booking.id}
                  href={`/account/bookings/${booking.id}`}
                  className="flex items-center justify-between bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mt-0.5 shrink-0">
                      <Waves className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{booking.booking_ref}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {booking.room_types?.name ?? 'Room TBC'}
                        {booking.packages?.name ? ` · ${booking.packages.name}` : ''}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {formatDate(booking.check_in_date)} – {formatDate(booking.check_out_date)}
                          {nights > 0 ? ` (${nights}N)` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{formatCurrency(booking.total_amount)}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Past bookings */}
      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Past trips</h2>
          <div className="space-y-3">
            {past.map(booking => {
              const cfg = STATUS_CONFIG[booking.status]
              const Icon = cfg.icon
              const nights = nightsCount(booking.check_in_date, booking.check_out_date)
              return (
                <Link
                  key={booking.id}
                  href={`/account/bookings/${booking.id}`}
                  className="flex items-center justify-between bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all opacity-80 hover:opacity-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mt-0.5 shrink-0">
                      <Waves className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 text-sm">{booking.booking_ref}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {booking.room_types?.name ?? 'Room TBC'}
                        {booking.packages?.name ? ` · ${booking.packages.name}` : ''}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDate(booking.check_in_date)} – {formatDate(booking.check_out_date)}
                          {nights > 0 ? ` (${nights}N)` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">{formatCurrency(booking.total_amount)}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {bookings.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Waves className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500 text-sm mb-6">Your trips will appear here once you make a booking.</p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary/80 transition-colors"
          >
            Book a trip
          </Link>
        </div>
      )}
    </div>
  )
}
