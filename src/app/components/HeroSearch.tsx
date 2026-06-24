'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useCurrency } from '@/components/CurrencyProvider'

export default function HeroSearch() {
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const today = new Date().toISOString().split('T')[0]
  const [tripType, setTripType] = useState<'day-trip' | 'liveaboard'>('day-trip')
  const [date, setDate] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (tripType === 'day-trip' && date) {
      params.set('checkIn', date)
      params.set('checkOut', date)
    } else if (tripType === 'liveaboard' && checkIn && checkOut) {
      params.set('checkIn', checkIn)
      params.set('checkOut', checkOut)
    }
    params.set('guests', String(guests))
    router.push(`/book?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
      {/* Trip type toggle */}
      <div className="flex justify-center gap-2 mb-4">
        <button type="button" onClick={() => setTripType('day-trip')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tripType === 'day-trip' ? 'bg-white text-primary shadow' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
          Day Trip · {formatPrice(1300)}/pax
        </button>
        <button type="button" onClick={() => setTripType('liveaboard')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tripType === 'liveaboard' ? 'bg-white text-primary shadow' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
          Liveaboard · {formatPrice(1500)}/night
        </button>
      </div>

      {/* Search fields */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-end">
        {tripType === 'day-trip' ? (
          <div className="flex-1 w-full">
            <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5">Date</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-white/20 text-white border border-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 [color-scheme:dark]"
            />
          </div>
        ) : (
          <>
            <div className="flex-1 w-full">
              <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5">Check-in</label>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={e => {
                  setCheckIn(e.target.value)
                  if (checkOut && e.target.value >= checkOut) setCheckOut('')
                }}
                className="w-full bg-white/20 text-white border border-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 [color-scheme:dark]"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5">Check-out</label>
              <input
                type="date"
                min={checkIn ? (() => { const d = new Date(checkIn); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] })() : today}
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                className="w-full bg-white/20 text-white border border-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 [color-scheme:dark]"
              />
            </div>
          </>
        )}

        <div className="w-full sm:w-24">
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
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-accent/90 transition-all duration-300 hover:scale-105 whitespace-nowrap"
        >
          <Search className="w-4 h-4" />
          Book Now
        </button>
      </div>
    </form>
  )
}
