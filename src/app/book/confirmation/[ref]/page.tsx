import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, XCircle, Mail, Calendar, Users, BedDouble } from 'lucide-react'
import type { Booking } from '@/types/database'

type BookingWithRelations = Booking & {
  room_type: { name: string; slug: string } | null
  package: { name: string; duration_days: number; num_dives: number | null } | null
}

interface Props {
  params: Promise<{ ref: string }>
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

export default async function ConfirmationPage({ params }: Props) {
  const { ref } = await params
  const supabase = await createClient()

  const { data: bookingRaw, error } = await supabase
    .from('bookings')
    .select(`
      *,
      room_type:room_types(name, slug),
      package:packages(name, duration_days, num_dives)
    `)
    .eq('booking_ref', ref)
    .single()

  if (error || !bookingRaw) notFound()

  const booking = bookingRaw as BookingWithRelations

  const config = statusConfig[booking.status as keyof typeof statusConfig] ?? statusConfig.pending_payment
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
                  <span>SGD {booking.total_amount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload receipt CTA if still pending payment */}
        {booking.status === 'pending_payment' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Complete Your Payment</h3>
            <p className="text-sm text-yellow-700 mb-3">
              Transfer <strong>SGD {booking.total_amount?.toLocaleString()}</strong> to:
            </p>
            <div className="text-sm text-yellow-800 space-y-1 bg-white rounded-lg p-3 mb-3">
              <div><span className="text-gray-500">Bank:</span> Maybank</div>
              <div><span className="text-gray-500">Account:</span> 5642 1234 5678</div>
              <div><span className="text-gray-500">Name:</span> Celebes Explorer Sdn Bhd</div>
              <div><span className="text-gray-500">Ref:</span> <strong>{booking.booking_ref}</strong></div>
            </div>
            <Link
              href={`/book?bookingId=${booking.id}&step=3`}
              className="block w-full text-center bg-yellow-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700"
            >
              Upload Receipt
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link href="/" className="text-primary hover:underline text-sm">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  )
}
