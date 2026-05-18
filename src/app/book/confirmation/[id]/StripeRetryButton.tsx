'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function StripeRetryButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleRetry() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId }),
    })
    const data = await res.json()
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl
    } else {
      setLoading(false)
      alert(data.error || 'Failed to create checkout session')
    }
  }

  return (
    <button
      onClick={handleRetry}
      disabled={loading}
      className="block w-full text-center bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary/80 disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
      {loading ? 'Redirecting...' : 'Try Again — Pay with Card'}
    </button>
  )
}
