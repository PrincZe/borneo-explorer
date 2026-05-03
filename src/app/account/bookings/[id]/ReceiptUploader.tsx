'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, CheckCircle } from 'lucide-react'

export default function ReceiptUploader({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleFile(file: File) {
    setError('')
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) {
      setError('File must be JPEG, PNG, WebP, or PDF.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB.')
      return
    }

    setUploading(true)
    const form = new FormData()
    form.append('receipt', file)

    const res = await fetch(`/api/customer/bookings/${bookingId}/receipt`, {
      method: 'POST',
      body: form,
    })

    setUploading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Upload failed. Please try again.')
      return
    }

    setDone(true)
    router.refresh()
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
        <CheckCircle className="w-4 h-4" />
        Receipt uploaded — our team will verify it shortly.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/80 disabled:opacity-50 transition-colors"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? 'Uploading...' : 'Upload receipt'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-gray-400">JPEG, PNG, WebP or PDF · Max 5MB</p>
    </div>
  )
}
