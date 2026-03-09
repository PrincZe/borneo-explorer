'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, CheckCircle, Loader2, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'

type Booking = {
  id: string
  booking_ref: string
  status: string
  customer_name: string
  total_amount: number | null
}

function UploadReceiptContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get('bookingId')
  const bookingRef = searchParams.get('ref')

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const fetchBooking = useCallback(async () => {
    const supabase = createClient()
    let query = supabase.from('bookings').select('id, booking_ref, status, customer_name, total_amount')

    if (bookingId) {
      query = query.eq('id', bookingId)
    } else if (bookingRef) {
      query = query.eq('booking_ref', bookingRef)
    } else {
      setError('No booking reference provided.')
      setLoading(false)
      return
    }

    const { data, error } = await query.single()
    if (error || !data) {
      setError('Booking not found.')
    } else if (data.status !== 'pending_payment') {
      setError(`This booking is already ${data.status.replace('_', ' ')} — no receipt needed.`)
    } else {
      setBooking(data)
    }
    setLoading(false)
  }, [bookingId, bookingRef])

  useEffect(() => { fetchBooking() }, [fetchBooking])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !booking) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('receipt', file)

    const res = await fetch(`/api/bookings/${booking.id}/receipt`, {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      setUploaded(true)
      setTimeout(() => router.push(`/book/confirmation/${booking.booking_ref}`), 2000)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Upload failed. Please try again.')
    }
    setUploading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Cannot Upload Receipt</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="text-primary hover:underline text-sm">← Back to Homepage</Link>
        </div>
      </div>
    )
  }

  if (uploaded) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Receipt Uploaded!</h1>
          <p className="text-gray-500">Redirecting to your confirmation page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Upload Payment Receipt</h1>
          {booking && (
            <p className="text-gray-500 text-sm mt-1">
              Booking <span className="font-mono font-semibold">{booking.booking_ref}</span> · {booking.customer_name}
            </p>
          )}
        </div>

        {booking && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Bank Transfer Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Bank</span>
                <span className="font-medium">Maybank</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Name</span>
                <span className="font-medium">Celebes Explorer Sdn Bhd</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account No.</span>
                <span className="font-medium font-mono">5642 1234 5678</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono font-bold text-primary">{booking.booking_ref}</span>
              </div>
              {booking.total_amount && (
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-primary">SGD {booking.total_amount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleUpload} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload your payment receipt
          </label>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
            }`}
            onClick={() => document.getElementById('receipt-input')?.click()}
          >
            <input
              id="receipt-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-primary">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to select file</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP or PDF · Max 5MB</p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-600 text-sm mt-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/80 disabled:opacity-50 transition-colors"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Submit Receipt'}
          </button>
        </form>

        <div className="text-center mt-6">
          {booking && (
            <Link href={`/book/confirmation/${booking.booking_ref}`} className="text-primary hover:underline text-sm">
              View booking confirmation →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UploadReceiptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <UploadReceiptContent />
    </Suspense>
  )
}
