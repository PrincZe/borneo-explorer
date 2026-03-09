'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, User, Mail, Phone, BedDouble, Package2,
  Calendar, Users, FileText, CheckCircle, XCircle, Clock, ExternalLink, Loader2
} from 'lucide-react'

type BookingDetail = {
  id: string
  booking_ref: string
  status: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  room_type: { id: string; name: string; slug: string; bed_type: string | null; size_sqm: number | null } | null
  package: { id: string; name: string; slug: string; duration_days: number; num_dives: number | null } | null
  check_in_date: string | null
  check_out_date: string | null
  num_guests: number
  certification_level: string | null
  logged_dives: number | null
  nitrox_required: boolean
  equipment_rental: boolean
  add_ons: Array<{ id: string; name: string; price: number; notes?: string }>
  special_requests: string | null
  payment_method: string | null
  payment_receipt_url: string | null
  receipt_signed_url: string | null
  total_amount: number | null
  admin_notes: string | null
  verified_by: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Pending Payment', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { value: 'pending_verification', label: 'Pending Verification', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'confirmed', label: 'Confirmed', color: 'text-green-700 bg-green-50 border-green-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-700 bg-red-50 border-red-200' },
]

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [saveMsg, setSaveMsg] = useState('')

  const fetchBooking = useCallback(async () => {
    const res = await fetch(`/api/admin/bookings/${id}`)
    if (!res.ok) { router.push('/admin/bookings'); return }
    const data = await res.json()
    setBooking(data.booking)
    setStatus(data.booking.status)
    setAdminNotes(data.booking.admin_notes ?? '')
    setLoading(false)
  }, [id, router])

  useEffect(() => { fetchBooking() }, [fetchBooking])

  async function handleSave() {
    setSaving(true)
    setSaveMsg('')
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    })
    if (res.ok) {
      setSaveMsg('Saved successfully')
      fetchBooking()
    } else {
      setSaveMsg('Failed to save')
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!booking) return null

  const currentStatus = STATUS_OPTIONS.find(s => s.value === booking.status)
  const addOns = Array.isArray(booking.add_ons) ? booking.add_ons : []

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/bookings" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 font-mono">{booking.booking_ref}</h1>
            {currentStatus && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Created {new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{booking.customer_name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${booking.customer_email}`} className="text-primary hover:underline">
                  {booking.customer_email}
                </a>
              </div>
              {booking.customer_phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{booking.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Booking Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {booking.room_type && (
                <div>
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <BedDouble className="w-3.5 h-3.5" />
                    <span className="text-xs uppercase tracking-wide font-medium">Cabin</span>
                  </div>
                  <div className="text-gray-900 font-medium">{booking.room_type.name}</div>
                  {booking.room_type.bed_type && (
                    <div className="text-xs text-gray-400">{booking.room_type.bed_type} · {booking.room_type.size_sqm}m²</div>
                  )}
                </div>
              )}

              {booking.package && (
                <div>
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Package2 className="w-3.5 h-3.5" />
                    <span className="text-xs uppercase tracking-wide font-medium">Package</span>
                  </div>
                  <div className="text-gray-900 font-medium">{booking.package.name}</div>
                  <div className="text-xs text-gray-400">
                    {booking.package.duration_days} days
                    {booking.package.num_dives ? ` · ${booking.package.num_dives} dives` : ''}
                  </div>
                </div>
              )}

              {booking.check_in_date && (
                <div>
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs uppercase tracking-wide font-medium">Dates</span>
                  </div>
                  <div className="text-gray-900">
                    {new Date(booking.check_in_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' → '}
                    {booking.check_out_date && new Date(booking.check_out_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs uppercase tracking-wide font-medium">Guests</span>
                </div>
                <div className="text-gray-900">{booking.num_guests}</div>
              </div>
            </div>

            {/* Dive info */}
            {(booking.certification_level || booking.logged_dives !== null) && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                {booking.certification_level && (
                  <div>
                    <div className="text-xs uppercase tracking-wide font-medium text-gray-400 mb-1">Certification</div>
                    <div className="text-gray-900">{booking.certification_level}</div>
                  </div>
                )}
                {booking.logged_dives !== null && (
                  <div>
                    <div className="text-xs uppercase tracking-wide font-medium text-gray-400 mb-1">Logged Dives</div>
                    <div className="text-gray-900">{booking.logged_dives}</div>
                  </div>
                )}
              </div>
            )}

            {/* Flags */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                {booking.nitrox_required ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-300" />
                )}
                <span className="text-gray-600">Nitrox</span>
              </div>
              <div className="flex items-center gap-1.5">
                {booking.equipment_rental ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-300" />
                )}
                <span className="text-gray-600">Equipment Rental</span>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          {addOns.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Add-ons</h2>
              <div className="space-y-2">
                {addOns.map((addon, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-800">{addon.name}</span>
                      {addon.notes && <span className="text-gray-400 text-xs ml-2">· {addon.notes}</span>}
                    </div>
                    <span className="text-gray-600 font-medium">SGD {addon.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special requests */}
          {booking.special_requests && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Special Requests</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{booking.special_requests}</p>
            </div>
          )}

          {/* Payment receipt */}
          {booking.receipt_signed_url && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Payment Receipt</h2>
              <a
                href={booking.receipt_signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                View Receipt
              </a>
            </div>
          )}
        </div>

        {/* Right column — actions */}
        <div className="space-y-5">
          {/* Amount */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="text-xs uppercase tracking-wide font-medium text-gray-400 mb-1">Total Amount</div>
            <div className="text-3xl font-bold text-gray-900">
              {booking.total_amount ? `SGD ${booking.total_amount.toLocaleString()}` : '—'}
            </div>
            <div className="text-xs text-gray-400 mt-1">Payment: {booking.payment_method ?? '—'}</div>

            {booking.verified_at && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-green-600">
                <Clock className="w-3.5 h-3.5" />
                <span>Verified {new Date(booking.verified_at).toLocaleDateString('en-GB')}</span>
              </div>
            )}
          </div>

          {/* Update status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Update Booking</h2>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Status</label>
              <div className="space-y-2">
                {STATUS_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={status === opt.value}
                      onChange={e => setStatus(e.target.value)}
                      className="text-primary"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Internal notes..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/80 disabled:opacity-50 transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {saveMsg && (
              <p className={`text-xs text-center mt-2 ${saveMsg.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
                {saveMsg}
              </p>
            )}
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Quick Links</h2>
            <div className="space-y-2">
              <a
                href={`mailto:${booking.customer_email}?subject=Re: Booking ${booking.booking_ref}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Customer
              </a>
              <Link
                href={`/book/confirmation/${booking.booking_ref}`}
                target="_blank"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <FileText className="w-4 h-4" />
                View Confirmation Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
