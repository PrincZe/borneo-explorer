import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StripeRetryButton from './StripeRetryButton'
import Link from 'next/link'
import { CheckCircle, Clock, XCircle, Mail, Calendar, Users, BedDouble } from 'lucide-react'
import type { Booking } from '@/types/database'

type BookingWithRelations = Booking & {
  room_type: { name: string; slug: string } | null
  package: { name: string; duration_days: number; num_dives: number | null } | null
}

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ payment?: string }>
}

const statusConfig = {
  pending_payment: {
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    label: 'Awaiting Payment',
    message: 'Please complete your bank transfer and upload your payment receipt.',
  },
  pending_verification: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'Pending Verification',
    message: 'We have received your receipt and are verifying your payment. We\'ll email you within 24 hours.',
  },
  confirmed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: 'Confirmed!',
    message: 'Your booking is confirmed. See you on the water!',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Cancelled',
    message: 'This booking has been cancelled. Please contact us if you have any questions.',
  },
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { id } = await params
  const { payment } = await searchParams
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: bookingRaw, error } = await supabase
    .from('bookings')
    .select(`
      *,
      room_type:room_types(name, slug),
      package:packages(name, duration_days, num_dives)
    `)
    .eq('id', id)
    .single()

  if (error || !bookingRaw) notFound()

  const booking = bookingRaw as BookingWithRelations

  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()

  const isStripe = booking.payment_method === 'stripe'
  const stripeProcessing = isStripe && payment === 'success' && booking.status === 'pending_payment'

  const config = stripeProcessing
    ? { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Processing Payment', message: 'Your payment was received and is being processed. This page will update shortly — you\'ll also receive a confirmation email.' }
    : (statusConfig[booking.status as keyof typeof statusConfig] ?? statusConfig.pending_payment)
  const StatusIcon = config.icon

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-lg mx-auto">
        {/* Status card */}
        <div className={`rounded-2xl border ${config.border} ${config.bg} p-8 text-center mb-6`}>
          <StatusIcon className={`w-16 h-16 ${config.color} mx-auto mb-4`} />
          <h1 className={`text-2xl font-bold ${config.color} mb-2`}>{config.label}</h1>
          <p className="text-gray-600">{config.message}</p>
        </div>

        {/* Booking details */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
            <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-full text-gray-700">
              {booking.booking_ref}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{booking.customer_name} · {booking.customer_email}</span>
            </div>

            {booking.room_type && (
              <div className="flex items-center gap-3 text-gray-700">
                <BedDouble className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{booking.room_type.name}</span>
              </div>
            )}

            {booking.package && (
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{booking.package.name}</span>
              </div>
            )}

            {booking.check_in_date && (
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  {new Date(booking.check_in_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' → '}
                  {booking.check_out_date && new Date(booking.check_out_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-700">
              <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{booking.num_guests} guest{booking.num_guests !== 1 ? 's' : ''}</span>
            </div>

            {booking.total_amount && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between font-bold text-primary">
                  <span>Total Amount</span>
                  <span>RM {booking.total_amount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bank transfer: show payment instructions */}
        {booking.status === 'pending_payment' && !isStripe && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Complete Your Payment</h3>
            <p className="text-sm text-yellow-700 mb-3">
              Transfer <strong>RM {booking.total_amount?.toLocaleString()}</strong> to:
            </p>
            <div className="text-sm text-yellow-800 space-y-1 bg-white rounded-lg p-3 mb-3">
              <div><span className="text-gray-500">Bank:</span> Maybank</div>
              <div><span className="text-gray-500">Account:</span> 5642 1234 5678</div>
              <div><span className="text-gray-500">Name:</span> Celebes Explorer Sdn Bhd</div>
              <div><span className="text-gray-500">Ref:</span> <strong>{booking.booking_ref}</strong></div>
            </div>
            <Link
              href={`/book/upload-receipt?bookingId=${booking.id}`}
              className="block w-full text-center bg-yellow-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700"
            >
              Upload Receipt
            </Link>
          </div>
        )}

        {/* Stripe: payment cancelled — show retry option */}
        {booking.status === 'pending_payment' && isStripe && payment === 'cancelled' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Payment Cancelled</h3>
            <p className="text-sm text-yellow-700 mb-3">
              Your payment was not completed. You can try again or contact us for assistance.
            </p>
            <StripeRetryButton bookingId={booking.id} />
          </div>
        )}

        {/* Account sign-up prompt — only show if not logged in */}
        {!user && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-primary mb-1">Track this booking online</h3>
            <p className="text-sm text-gray-600 mb-3">
              Create a free account with <strong>{booking.customer_email}</strong> to view your booking status, receipts, and loyalty rewards — all in one place.
            </p>
            <div className="flex gap-3">
              <Link
                href="/account/signup"
                className="flex-1 text-center bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary/80 transition-colors"
              >
                Create account
              </Link>
              <Link
                href="/account/login"
                className="flex-1 text-center border border-primary text-primary py-2 rounded-lg text-sm font-semibold hover:bg-primary/5 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/" className="text-primary hover:underline text-sm">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  )
}
