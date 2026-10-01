'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useCurrency } from '@/components/CurrencyProvider'
import { upcomingDepartureDates, deriveCheckout } from '@/lib/departures'

// Mirrors the fixed-departure packages (see packages migration).
const PACKAGES = [
  { slug: '4d3n-liveaboard', label: '4D3N', nights: 3, checkinWeekday: 2, priceMYR: 4500 },
  { slug: '5d4n-liveaboard', label: '5D4N', nights: 4, checkinWeekday: 5, priceMYR: 6000 },
  { slug: '7d6n-liveaboard', label: '7D6N', nights: 6, checkinWeekday: 2, priceMYR: 9000 },
]

export default function HeroSearch() {
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const [packageSlug, setPackageSlug] = useState(PACKAGES[0].slug)
  const [checkIn, setCheckIn] = useState('')
  const [guests, setGuests] = useState(2)

  const selectedPackage = PACKAGES.find(p => p.slug === packageSlug) ?? PACKAGES[0]
  const departureOptions = useMemo(
    () => upcomingDepartureDates(selectedPackage.checkinWeekday, 12),
    [selectedPackage.checkinWeekday]
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('packageSlug', packageSlug)
    if (checkIn) {
      params.set('checkIn', checkIn)
      params.set('checkOut', deriveCheckout(checkIn, selectedPackage.nights))
    }
    params.set('guests', String(guests))
    router.push(`/book?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
      {/* Search fields */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-end">
        <div className="w-full sm:w-32">
          <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5">Package</label>
          <select
            value={packageSlug}
            onChange={e => { setPackageSlug(e.target.value); setCheckIn('') }}
            className="w-full bg-white/20 text-white border border-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 [color-scheme:dark]"
          >
            {PACKAGES.map(pkg => (
              <option key={pkg.slug} value={pkg.slug} className="text-gray-900">{pkg.label}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-44">
          <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5">Departure</label>
          <select
            value={checkIn}
            onChange={e => setCheckIn(e.target.value)}
            className="w-full bg-white/20 text-white border border-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 [color-scheme:dark]"
          >
            <option value="">Choose a date...</option>
            {departureOptions.map(d => (
              <option key={d} value={d} className="text-gray-900">
                {new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-20">
          <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5">Guests</label>
          <input
            type="number"
            min={1}
            max={10}
            value={guests}
            onChange={e => setGuests(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            className="w-full bg-white/20 text-white border border-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 [color-scheme:dark]"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto sm:flex-1 flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-accent/90 transition-all duration-300 hover:scale-105 whitespace-nowrap"
        >
          <Search className="w-4 h-4" />
          Book Now
        </button>
      </div>

      <p className="text-center text-white/70 text-xs mt-3">
        {selectedPackage.label} · {selectedPackage.nights} nights · {formatPrice(selectedPackage.priceMYR)} per person
      </p>
    </form>
  )
}
