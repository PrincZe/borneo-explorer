import { Suspense } from 'react'
import BookingContent from './content'

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading booking form...</div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
