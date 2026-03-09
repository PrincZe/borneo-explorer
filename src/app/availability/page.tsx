'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'
import { Calendar, Ship, Users, Search } from 'lucide-react'

export default function AvailabilityPage() {
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
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">

        <AnimateOnScroll animation="fade-in">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Check Availability</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select your preferred dates to see available cabins and packages for MV Celebes Explorer.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: Ship, title: 'Vessel Capacity', desc: 'Up to 10 divers per trip' },
            { icon: Users, title: 'Group Bookings', desc: 'Private charters available' },
            { icon: Calendar, title: 'Booking Window', desc: 'Book up to 12 months ahead' },
          ].map((info, i) => (
            <AnimateOnScroll key={i} animation="slide-up" delay={i * 0.1}>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <info.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{info.title}</h3>
                <p className="text-gray-500 text-sm">{info.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Date Picker */}
        <AnimateOnScroll animation="scale-up">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Search Available Cabins
            </h2>
            <form onSubmit={handleSearch} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Check-in Date</label>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={e => {
                      setCheckIn(e.target.value)
                      if (checkOut && e.target.value > checkOut) setCheckOut('')
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Check-out Date</label>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary/80 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {checkIn && checkOut ? 'Check Availability' : 'Browse All Cabins'}
              </button>
            </form>
          </div>
        </AnimateOnScroll>

        {/* Info grid */}
        <AnimateOnScroll animation="fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">How It Works</h3>
              <ol className="space-y-3">
                {[
                  { num: '1', title: 'Pick your dates', desc: 'Choose your check-in and check-out dates above.' },
                  { num: '2', title: 'Choose your cabin', desc: 'Browse available cabins and select your preferred package.' },
                  { num: '3', title: 'Complete booking', desc: 'Fill in your details and upload your payment receipt.' },
                ].map(step => (
                  <li key={step.num} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {step.num}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{step.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{step.desc}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Important Notes</h3>
              <ul className="space-y-3">
                {[
                  { title: 'Sipadan Permits', desc: 'All packages include guaranteed Sipadan diving permits.' },
                  { title: 'Group Discounts', desc: 'Special rates for groups of 4 or more divers.' },
                  { title: 'Weather', desc: 'Diving schedules may be adjusted for safety due to weather.' },
                ].map(note => (
                  <li key={note.title} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">!</div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{note.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{note.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  )
}
