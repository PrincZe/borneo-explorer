'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function HeroSearch() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (checkIn && checkOut) {
      router.push(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}`)
    } else {
      router.push('/rooms')
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-end max-w-2xl mx-auto"
    >
      <div className="flex-1 w-full">
        <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5">
          Check-in
        </label>
        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={e => {
            setCheckIn(e.target.value)
            if (checkOut && e.target.value > checkOut) setCheckOut('')
          }}
          className="w-full bg-white/20 text-white placeholder-white/50 border border-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 [color-scheme:dark]"
        />
      </div>

      <div className="flex-1 w-full">
        <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5">
          Check-out
        </label>
        <input
          type="date"
          min={checkIn || today}
          value={checkOut}
          onChange={e => setCheckOut(e.target.value)}
          className="w-full bg-white/20 text-white placeholder-white/50 border border-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 [color-scheme:dark]"
        />
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-accent/80 transition-all duration-300 hover:scale-105 whitespace-nowrap"
      >
        <Search className="w-4 h-4" />
        {checkIn && checkOut ? 'Check Availability' : 'Browse Cabins'}
      </button>
    </form>
  )
}
