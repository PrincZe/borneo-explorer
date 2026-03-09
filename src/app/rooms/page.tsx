'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Maximize2, BedDouble, CheckCircle, Calendar, ArrowRight } from 'lucide-react'
import type { RoomType, Package, RoomPackagePricing } from '@/types/database'

type RoomWithPricing = RoomType & {
  room_package_pricing: (RoomPackagePricing & { packages: Package })[]
  available: boolean
}

function RoomsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''

  const [rooms, setRooms] = useState<RoomWithPricing[]>([])
  const [loading, setLoading] = useState(false)
  const [localCheckIn, setLocalCheckIn] = useState(checkIn)
  const [localCheckOut, setLocalCheckOut] = useState(checkOut)

  useEffect(() => {
    if (checkIn && checkOut) {
      setLoading(true)
      fetch(`/api/rooms/availability?start=${checkIn}&end=${checkOut}`)
        .then(r => r.json())
        .then(d => setRooms(d.rooms || []))
        .finally(() => setLoading(false))
    } else {
      // Load all rooms without availability filter
      fetch('/api/rooms/availability?start=2026-01-01&end=2030-12-31')
        .then(r => r.json())
        .then(d => setRooms(d.rooms || []))
        .finally(() => setLoading(false))
      setLoading(true)
    }
  }, [checkIn, checkOut])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/rooms?checkIn=${localCheckIn}&checkOut=${localCheckOut}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Choose Your Cabin</h1>
          <p className="text-blue-200 text-lg">Select dates to check availability</p>

          <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1">
              <label className="text-blue-200 text-sm mb-1 block">Check-in</label>
              <input
                type="date"
                min={today}
                value={localCheckIn}
                onChange={e => setLocalCheckIn(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-gray-900 bg-white border-0 focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex-1">
              <label className="text-blue-200 text-sm mb-1 block">Check-out</label>
              <input
                type="date"
                min={localCheckIn || today}
                value={localCheckOut}
                onChange={e => setLocalCheckOut(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-gray-900 bg-white border-0 focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="self-end">
              <button
                type="submit"
                disabled={!localCheckIn || !localCheckOut}
                className="px-6 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Room Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {checkIn && checkOut && (
          <p className="text-gray-600 mb-6">
            Showing cabins for{' '}
            <strong>{new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            {' '}→{' '}
            <strong>{new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
          </p>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => {
              const lowestPrice = room.room_package_pricing?.length
                ? Math.min(...room.room_package_pricing.map(rp => rp.price_override ?? (rp.packages?.price_per_person ?? 0)))
                : null

              return (
                <div
                  key={room.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col ${
                    !room.available && (checkIn && checkOut) ? 'opacity-60' : ''
                  }`}
                >
                  {/* Image placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                    <BedDouble className="w-16 h-16 text-primary/40" />
                    {checkIn && checkOut && (
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                        room.available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {room.available ? 'Available' : 'Unavailable'}
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{room.name}</h2>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{room.description}</p>

                    {/* Specs */}
                    <div className="flex gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> Up to {room.max_occupancy}
                      </span>
                      {room.size_sqm && (
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-4 h-4" /> {room.size_sqm} m²
                        </span>
                      )}
                      {room.bed_type && (
                        <span className="flex items-center gap-1">
                          <BedDouble className="w-4 h-4" /> {room.bed_type}
                        </span>
                      )}
                    </div>

                    {/* Amenities (first 3) */}
                    {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(room.amenities as string[]).slice(0, 3).map(a => (
                          <span key={a} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> {a}
                          </span>
                        ))}
                        {(room.amenities as string[]).length > 3 && (
                          <span className="text-xs text-gray-400">+{(room.amenities as string[]).length - 3} more</span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between">
                      {lowestPrice !== null && (
                        <div>
                          <span className="text-xs text-gray-400">From</span>
                          <div className="text-xl font-bold text-primary">SGD {lowestPrice.toLocaleString()}</div>
                          <span className="text-xs text-gray-400">per person</span>
                        </div>
                      )}
                      <Link
                        href={`/rooms/${room.slug}${checkIn ? `?checkIn=${checkIn}&checkOut=${checkOut}` : ''}`}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/80 transition-colors"
                      >
                        View <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <RoomsContent />
    </Suspense>
  )
}
