import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Users, BedDouble, Package2,
  CheckCircle, Clock, Upload, XCircle, FileText, ExternalLink, Award
} from 'lucide-react'
import ReceiptUploader from './ReceiptUploader'

const STATUS_CONFIG = {
  pending_payment: { label: 'Awaiting Payment', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  pending_verification: { label: 'Verifying Payment', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Upload },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
} as const

const STATUS_STEPS = ['pending_payment', 'pending_verification', 'confirmed'] as const

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function formatCurrency(amount: number | null) {
  if (amount == null) return '—'
  return `SGD ${amount.toLocaleString('en-SG', { minimumFractionDigits: 2 })}`
}

function nightsCount(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 0
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
}

export default async function CustomerBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account/login')

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, booking_ref, status, customer_name, customer_email, customer_phone,
      check_in_date, check_out_date, num_guests, certification_level, logged_dives,
      nitrox_required, equipment_rental, add_ons, special_requests,
      payment_method, payment_receipt_url, total_amount, discount_amount,
      created_at,
      room_types ( name, bed_type, size_sqm ),
      packages ( name, duration_days, num_dives )
    `)
    .eq('id', id)
    .eq('customer_user_id', user.id)
    .single()

  if (!booking) notFound()

  // Generate a signed receipt URL server-side (bucket is private)
  let receiptSignedUrl: string | null = null
  if (booking.payment_receipt_url) {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    const { data } = await adminClient.storage
      .from('receipts')
      .createSignedUrl(booking.payment_receipt_url, 60 * 60) // 1 hour
    receiptSignedUrl = data?.signedUrl ?? null
  }

  const status = booking.status as keyof typeof STATUS_CONFIG
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_payment
  const StatusIcon = cfg.icon
  const nights = nightsCount(booking.check_in_date, booking.check_out_date)
  const addOns = (booking.add_ons as Array<{ name: string; price: number }>) ?? []
  const isCancelled = status === 'cancelled'
  const stepIndex = STATUS_STEPS.indexOf(status as typeof STATUS_STEPS[number])

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link href="/account" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          My bookings
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{booking.booking_ref}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Booked on {new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${cfg.color}`}>
            <StatusIcon className="w-4 h-4" />
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Progress stepper (hide if cancelled) */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => {
              const stepCfg = STATUS_CONFIG[step]
              const StepIcon = stepCfg.icon
              const done = stepIndex > i
              const active = stepIndex === i
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center gap-1 ${i === STATUS_STEPS.length - 1 ? 'flex-none' : 'flex-1'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      done ? 'bg-green-500' : active ? 'bg-primary' : 'bg-gray-200'
                    }`}>
                      <StepIcon className={`w-4 h-4 ${done || active ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <span className={`text-xs text-center leading-tight ${active ? 'text-primary font-semibold' : done ? 'text-green-600' : 'text-gray-400'}`}>
                      {stepCfg.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 -mt-5 mx-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Trip details */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-semibold text-gray-900">Trip details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <BedDouble className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Cabin</p>
              <p className="text-sm font-medium text-gray-900">
                {(booking.room_types as { name: string } | null)?.name ?? '—'}
              </p>
              {(() => {
                const rt = booking.room_types as { bed_type: string | null; size_sqm: number | null } | null
                return rt?.bed_type ? (
                  <p className="text-xs text-gray-400">{rt.bed_type}{rt.size_sqm ? ` · ${rt.size_sqm}m²` : ''}</p>
                ) : null
              })()}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Package2 className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Package</p>
              <p className="text-sm font-medium text-gray-900">
                {(booking.packages as { name: string } | null)?.name ?? 'No package'}
              </p>
              {(() => {
                const pkg = booking.packages as { duration_days: number; num_dives: number | null } | null
                return pkg ? (
                  <p className="text-xs text-gray-400">{pkg.duration_days} days{pkg.num_dives ? ` · ${pkg.num_dives} dives` : ''}</p>
                ) : null
              })()}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Dates</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(booking.check_in_date)}</p>
              <p className="text-xs text-gray-400">to {formatDate(booking.check_out_date)}</p>
              {nights > 0 && (
                <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {nights} nights
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Guests</p>
              <p className="text-sm font-medium text-gray-900">{booking.num_guests} guest{booking.num_guests !== 1 ? 's' : ''}</p>
              {booking.certification_level && (
                <p className="text-xs text-gray-400">{booking.certification_level}</p>
              )}
            </div>
          </div>
        </div>

        {addOns.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-2">Add-ons</p>
            <ul className="space-y-1">
              {addOns.map((a, i) => (
                <li key={i} className="flex justify-between text-sm text-gray-700">
                  <span>{a.name}</span>
                  <span className="text-gray-500">SGD {a.price.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {booking.special_requests && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-1">Special requests</p>
            <p className="text-sm text-gray-700">{booking.special_requests}</p>
          </div>
        )}
      </div>

      {/* Payment summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Payment</h2>
        <div className="space-y-2 text-sm">
          {booking.discount_amount != null && booking.discount_amount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount applied</span>
              <span>– {formatCurrency(booking.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-gray-900 text-base border-t border-gray-100 pt-2">
            <span>Total</span>
            <span>{formatCurrency(booking.total_amount)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Payment via {booking.payment_method === 'bank_transfer' ? 'bank transfer' : booking.payment_method ?? '—'}
          </p>
        </div>
      </div>

      {/* Receipt */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          Payment receipt
        </h2>

        {receiptSignedUrl ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Receipt uploaded</p>
              <p className="text-xs text-gray-500">
                {status === 'confirmed' ? 'Payment verified by our team.' : 'Under review by our team.'}
              </p>
            </div>
            <a
              href={receiptSignedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline shrink-0"
            >
              View <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : status === 'pending_payment' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please upload your bank transfer receipt to confirm your booking.
            </p>
            <ReceiptUploader bookingId={booking.id} />
          </div>
        ) : (
          <p className="text-sm text-gray-400">No receipt uploaded.</p>
        )}
      </div>
    </div>
  )
}
