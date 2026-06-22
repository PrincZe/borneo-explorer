'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { RoomType, Package, AddOnOption } from '@/types/database'
import { useCurrency } from '@/components/CurrencyProvider'

const step1Schema = z.object({
  room_type_id: z.string().min(1, 'Please select a cabin'),
  package_id: z.string().min(1, 'Please select a package'),
  check_in_date: z.string().min(1, 'Check-in date required'),
  check_out_date: z.string().min(1, 'Check-out date required'),
  num_guests: z.number().min(1).max(10),
  certification_level: z.string().optional(),
  logged_dives: z.number().int().min(0).optional(),
  nitrox_required: z.boolean(),
  equipment_rental: z.boolean(),
})

const step2Schema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  customer_email: z.string().email('Invalid email address'),
  customer_phone: z.string().optional(),
  special_requests: z.string().optional(),
})

const fullSchema = step1Schema.merge(step2Schema).extend({
  selected_addons: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof fullSchema>

const CERT_LEVELS = ['Open Water', 'Advanced Open Water', 'Rescue Diver', 'Divemaster', 'Instructor']

export default function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { formatPrice, currency } = useCurrency()

  const roomSlug = searchParams.get('roomSlug') || ''
  const packageSlug = searchParams.get('packageSlug') || ''
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''

  const [step, setStep] = useState(1)
  const [rooms, setRooms] = useState<RoomType[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [addOns, setAddOns] = useState<AddOnOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'bank_transfer'>('stripe')
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)

  // Step 1 custom validation errors
  const [step1Errors, setStep1Errors] = useState<{ date?: string; guests?: string }>({})

  // Promo code state
  const [promoInput, setPromoInput] = useState('')
  const [promoStatus, setPromoStatus] = useState<'idle' | 'valid' | 'invalid' | 'checking'>('idle')
  const [promoData, setPromoData] = useState<{ id: string; code: string; discount_type: string; discount_value: number; affiliate_name: string | null } | null>(null)

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      check_in_date: checkIn,
      check_out_date: checkOut,
      num_guests: 2,
      nitrox_required: false,
      equipment_rental: false,
      selected_addons: [],
    }
  })

  const selectedRoomId = watch('room_type_id')
  const selectedPackageId = watch('package_id')
  const selectedAddons = watch('selected_addons') ?? []

  const loadInitialData = useCallback(async () => {
    const [roomData, pkgData, addOnData] = await Promise.all([
      fetch('/api/rooms/availability?start=2026-01-01&end=2030-12-31').then(r => r.json()).catch(() => ({ rooms: [] })),
      fetch('/api/packages').then(r => r.json()).catch(() => ({ packages: [] })),
      fetch('/api/add-ons').then(r => r.json()).catch(() => ({ add_ons: [] })),
    ])
    setRooms(roomData.rooms || [])
    setPackages(pkgData.packages || [])
    setAddOns(addOnData.add_ons || [])

    if (roomSlug) {
      const room = (roomData.rooms || []).find((r: RoomType) => r.slug === roomSlug)
      if (room) setValue('room_type_id', room.id)
    }
  }, [roomSlug, setValue])

  useEffect(() => { loadInitialData() }, [loadInitialData])

  // Auto-fill customer info from logged-in user's profile
  useEffect(() => {
    async function prefillFromUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) setValue('customer_name', profile.full_name)
      if (user.email) setValue('customer_email', user.email)
      if (user.phone) setValue('customer_phone', user.phone)
    }
    prefillFromUser()
  }, [setValue])

  // Auto-detect ref_code cookie on mount
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)ref_code=([^;]+)/)
    if (match) {
      const code = decodeURIComponent(match[1])
      setPromoInput(code)
      validatePromo(code)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function validatePromo(code: string) {
    if (!code.trim()) { setPromoStatus('idle'); setPromoData(null); return }
    setPromoStatus('checking')
    const res = await fetch(`/api/promo?code=${encodeURIComponent(code.trim())}`)
    const data = await res.json()
    if (data.valid) {
      setPromoStatus('valid')
      setPromoData(data)
    } else {
      setPromoStatus('invalid')
      setPromoData(null)
    }
  }

  // Auto-select package based on dates
  const watchCheckIn = watch('check_in_date')
  const watchCheckOut = watch('check_out_date')

  function calcNights(): number {
    if (!watchCheckIn || !watchCheckOut) return 0
    if (watchCheckIn === watchCheckOut) return 0
    const msPerDay = 86400000
    const diff = (new Date(watchCheckOut).getTime() - new Date(watchCheckIn).getTime()) / msPerDay
    return Math.max(0, Math.round(diff))
  }

  const nights = calcNights()
  const isDayTrip = watchCheckIn && watchCheckOut && watchCheckIn === watchCheckOut

  useEffect(() => {
    if (!packages.length) return
    if (isDayTrip) {
      const pkg = packages.find(p => p.slug === 'day-trip')
      if (pkg) setValue('package_id', pkg.id)
    } else if (nights > 0) {
      const pkg = packages.find(p => p.slug === '1d1n-liveaboard')
      if (pkg) setValue('package_id', pkg.id)
    } else if (packageSlug) {
      const pkg = packages.find(p => p.slug === packageSlug)
      if (pkg) setValue('package_id', pkg.id)
    }
  }, [watchCheckIn, watchCheckOut, packages, packageSlug, isDayTrip, nights, setValue])

  const selectedRoom = rooms.find(r => r.id === selectedRoomId)
  const selectedPackage = packages.find(p => p.id === selectedPackageId)

  function calcSubtotal() {
    const basePrice = selectedPackage?.price_per_person ?? 0
    const guests = watch('num_guests') ?? 1
    const multiplier = isDayTrip ? 1 : Math.max(1, nights)
    const addonTotal = addOns
      .filter(a => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0)
    return basePrice * multiplier * guests + addonTotal
  }

  function calcDiscount(subtotal: number) {
    if (!promoData || promoStatus !== 'valid') return 0
    if (promoData.discount_type === 'percent') return Math.round(subtotal * promoData.discount_value / 100 * 100) / 100
    if (promoData.discount_type === 'fixed') return Math.min(promoData.discount_value, subtotal)
    return 0
  }

  function calcTotal() {
    const subtotal = calcSubtotal()
    return subtotal - calcDiscount(subtotal)
  }

  async function onStep1Next() {
    const valid = await trigger([
      'room_type_id', 'package_id', 'check_in_date', 'check_out_date',
      'num_guests', 'nitrox_required', 'equipment_rental',
    ])

    const customErrors: { date?: string; guests?: string } = {}
    const checkIn = watch('check_in_date')
    const checkOut = watch('check_out_date')
    const numGuests = watch('num_guests')

    if (checkIn && checkOut && checkOut < checkIn) {
      customErrors.date = 'Check-out date cannot be before check-in date'
    }
    if (selectedRoom && numGuests > selectedRoom.max_occupancy) {
      customErrors.guests = `This cabin fits a maximum of ${selectedRoom.max_occupancy} guest${selectedRoom.max_occupancy !== 1 ? 's' : ''}`
    }
    setStep1Errors(customErrors)

    if (valid && Object.keys(customErrors).length === 0) setStep(2)
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    try {
      const addOnItems = addOns
        .filter(a => (data.selected_addons ?? []).includes(a.id))
        .map(a => ({ id: a.id, name: a.name, price: a.price }))

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          add_ons: addOnItems,
          payment_method: paymentMethod,
          ...(promoData && promoStatus === 'valid' ? { promo_code: promoData.code } : {}),
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Booking failed')

      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl
        return
      }

      setBookingId(json.booking.id)
      setStep(3)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReceiptUpload() {
    if (!receiptFile || !bookingId) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('receipt', receiptFile)
      const res = await fetch(`/api/bookings/${bookingId}/receipt`, {
        method: 'POST',
        body: form,
      })
      if (!res.ok) throw new Error('Upload failed')
      const json = await res.json()
      setUploadDone(true)
      router.push(`/book/confirmation/${json.booking.id}`)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const steps = ['Trip Details', 'Your Info', 'Payment']

  const pricingSummary = selectedPackage && (watchCheckIn && watchCheckOut) ? (
    <div className="bg-white rounded-2xl shadow p-5 sticky top-28">
      <h3 className="font-bold text-gray-900 mb-3">Price Summary</h3>
      <div className="space-y-2 text-sm text-gray-700">
        {selectedRoom && <div className="flex justify-between"><span>Cabin</span><span>{selectedRoom.name}</span></div>}
        <div className="flex justify-between"><span>Package</span><span>{isDayTrip ? 'Day Trip' : `${nights} Night${nights > 1 ? 's' : ''} Liveaboard`}</span></div>
        <div className="flex justify-between"><span>Guests</span><span>{watch('num_guests')}</span></div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Rate</span>
          <span>{formatPrice(selectedPackage.price_per_person)} {isDayTrip ? '× ' : `× ${nights} night${nights > 1 ? 's' : ''} × `}{watch('num_guests')} pax</span>
        </div>
        {selectedAddons.length > 0 && addOns.filter(a => selectedAddons.includes(a.id)).map(a => (
          <div key={a.id} className="flex justify-between text-gray-500"><span>+ {a.name}</span><span>{formatPrice(a.price)}</span></div>
        ))}
        {promoStatus === 'valid' && promoData && calcDiscount(calcSubtotal()) > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({promoData.code})</span>
            <span>- {formatPrice(calcDiscount(calcSubtotal()))}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-primary text-lg pt-2 border-t border-gray-100">
          <span>Total</span><span>{formatPrice(calcTotal())}</span>
        </div>
        {currency !== 'MYR' && <p className="text-xs text-gray-400">Charged in MYR. Displayed price is approximate.</p>}
      </div>
    </div>
  ) : null

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Dive Trip</h1>
        <p className="text-gray-500 mb-8">Aboard MV Celebes Explorer</p>

        {/* Step indicator */}
        <div className="flex items-center mb-8 max-w-2xl">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i + 1 < step ? 'bg-green-500 text-white' :
                i + 1 === step ? 'bg-primary text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`ml-2 text-sm font-medium hidden sm:block ${i + 1 === step ? 'text-primary' : 'text-gray-400'}`}>
                {s}
              </span>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-3" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Trip Details */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow p-6 space-y-5">
              <h2 className="text-xl font-bold text-gray-900">Trip Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Cabin <span className="text-red-500">*</span></label>
                {selectedRoom && roomSlug ? (
                  <>
                    <input type="hidden" {...register('room_type_id')} />
                    <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-700">
                      {selectedRoom.name} — {selectedRoom.bed_type} bed
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      <button type="button" onClick={() => { setValue('room_type_id', ''); window.history.replaceState(null, '', '/book') }} className="text-primary hover:underline">Change cabin</button>
                    </p>
                  </>
                ) : (
                  <select {...register('room_type_id')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="">Choose a cabin...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} — {r.bed_type} bed</option>
                    ))}
                  </select>
                )}
                {errors.room_type_id && <p className="text-red-500 text-sm mt-1">{errors.room_type_id.message}</p>}
              </div>

              {/* Package auto-detected from dates */}
              <input type="hidden" {...register('package_id')} />
              {selectedPackage && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                  <p className="text-sm font-medium text-primary">
                    {isDayTrip ? '📍 Day Trip' : `🚢 ${nights} Night${nights > 1 ? 's' : ''} Liveaboard`}
                    {' — '}{formatPrice(selectedPackage.price_per_person)}{isDayTrip ? '/person' : '/person/night'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date <span className="text-red-500">*</span></label>
                  <input type="date" min={today} {...register('check_in_date')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent" />
                  {errors.check_in_date && <p className="text-red-500 text-sm mt-1">{errors.check_in_date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date <span className="text-xs text-gray-400 font-normal">(same day = day trip)</span> <span className="text-red-500">*</span></label>
                  <input type="date" min={watchCheckIn || today} {...register('check_out_date')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent" />
                  {errors.check_out_date && <p className="text-red-500 text-sm mt-1">{errors.check_out_date.message}</p>}
                </div>
              </div>
              {step1Errors.date && <p className="text-red-500 text-sm">{step1Errors.date}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                <input type="number" min={1} max={10} {...register('num_guests', { valueAsNumber: true, min: 1, max: 10 })}
                  onBlur={(e) => { const v = parseInt(e.target.value); if (v < 1) setValue('num_guests', 1); else if (v > 10) setValue('num_guests', 10); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent" />
                {step1Errors.guests && <p className="text-red-500 text-sm mt-1">{step1Errors.guests}</p>}
                {selectedRoom && <p className="text-xs text-gray-400 mt-1">Max {selectedRoom.max_occupancy} guest{selectedRoom.max_occupancy !== 1 ? 's' : ''} for this cabin</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Level</label>
                <select {...register('certification_level')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="">Select level...</option>
                  {CERT_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Logged Dives</label>
                <input type="number" min={0} {...register('logged_dives', { setValueAs: (v: string) => v === '' ? undefined : Number(v) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g. 50" />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('nitrox_required')} className="w-4 h-4 accent-primary" />
                  <span className="text-sm">Nitrox certified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('equipment_rental')} className="w-4 h-4 accent-primary" />
                  <span className="text-sm">Equipment rental needed</span>
                </label>
              </div>

              {/* Mobile pricing summary */}
              {pricingSummary && (
                <div className="lg:hidden">
                  {pricingSummary}
                </div>
              )}

              <button type="button" onClick={onStep1Next}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/80 transition-colors">
                Next: Your Info <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Contact + Add-ons */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input {...register('customer_name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="John Smith" />
                  {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" {...register('customer_email')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="john@example.com" />
                  {errors.customer_email && <p className="text-red-500 text-sm mt-1">{errors.customer_email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input {...register('customer_phone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="+60 12-345 6789" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                  <textarea {...register('special_requests')} rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Any dietary requirements, accessibility needs, or special arrangements..." />
                </div>
              </div>

              {addOns.length > 0 && (
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Optional Add-ons</h2>
                  <div className="space-y-3">
                    {addOns.map(a => (
                      <label key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedAddons.includes(a.id) ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedAddons.includes(a.id)}
                          onChange={e => {
                            const next = e.target.checked
                              ? [...selectedAddons, a.id]
                              : selectedAddons.filter(x => x !== a.id)
                            setValue('selected_addons', next)
                          }}
                          className="mt-0.5 w-4 h-4 accent-primary"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">{a.name}</span>
                            <span className="text-primary font-semibold">+{formatPrice(a.price)}</span>
                          </div>
                          {a.description && <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Promo Code</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={e => {
                      setPromoInput(e.target.value.toUpperCase())
                      setPromoStatus('idle')
                      setPromoData(null)
                    }}
                    placeholder="Enter promo code (optional)"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => validatePromo(promoInput)}
                    disabled={promoStatus === 'checking' || !promoInput.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/80 disabled:opacity-50 transition-colors"
                  >
                    {promoStatus === 'checking' ? '...' : 'Apply'}
                  </button>
                </div>
                {promoStatus === 'valid' && promoData && (
                  <p className="text-green-600 text-sm mt-2">
                    ✓ Code applied — {promoData.discount_type === 'percent' ? `${promoData.discount_value}% off` : `${formatPrice(promoData.discount_value)} off`}
                    {promoData.affiliate_name ? ` (via ${promoData.affiliate_name})` : ''}
                  </p>
                )}
                {promoStatus === 'invalid' && (
                  <p className="text-red-500 text-sm mt-2">✗ Invalid or expired promo code</p>
                )}
              </div>

              {/* Summary */}
              {selectedRoom && selectedPackage && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div className="flex justify-between"><span>Cabin</span><span>{selectedRoom.name}</span></div>
                    <div className="flex justify-between"><span>Package</span><span>{isDayTrip ? 'Day Trip' : `${nights} Night${nights > 1 ? 's' : ''} Liveaboard`}</span></div>
                    <div className="flex justify-between"><span>Guests</span><span>{watch('num_guests')}</span></div>
                    <div className="flex justify-between">
                      <span>Base price</span>
                      <span>{formatPrice(selectedPackage.price_per_person)} × {isDayTrip ? '' : `${nights} night${nights > 1 ? 's' : ''} × `}{watch('num_guests')} pax = {formatPrice(selectedPackage.price_per_person * (isDayTrip ? 1 : Math.max(1, nights)) * (watch('num_guests') ?? 1))}</span>
                    </div>
                    {selectedAddons.length > 0 && addOns.filter(a => selectedAddons.includes(a.id)).map(a => (
                      <div key={a.id} className="flex justify-between text-gray-500"><span>+ {a.name}</span><span>{formatPrice(a.price)}</span></div>
                    ))}
                    {promoStatus === 'valid' && promoData && calcDiscount(calcSubtotal()) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({promoData.code})</span>
                        <span>- {formatPrice(calcDiscount(calcSubtotal()))}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-primary text-base pt-2 border-t border-primary/20">
                      <span>Total</span><span>{formatPrice(calcTotal())}</span>
                    </div>
                    {currency !== 'MYR' && <p className="text-xs text-gray-400 mt-2">You will be charged in MYR. Displayed price is approximate.</p>}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="payment_method" value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="w-4 h-4 accent-primary" />
                    <div>
                      <span className="font-medium text-gray-900">Pay with Card</span>
                      <p className="text-xs text-gray-500">Visa, Mastercard, AMEX — instant confirmation</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="payment_method" value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="w-4 h-4 accent-primary" />
                    <div>
                      <span className="font-medium text-gray-900">Bank Transfer</span>
                      <p className="text-xs text-gray-500">Manual transfer — verification within 24 hours</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/80 disabled:opacity-50 transition-colors">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {submitting ? 'Processing...' : paymentMethod === 'stripe' ? 'Pay with Card' : 'Continue to Payment'}
                  {!submitting && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </form>
        </div>

        {/* Pricing Sidebar */}
        {(step === 1 || step === 2) && (
          <div className="hidden lg:block">
            {pricingSummary}
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-6 lg:col-span-2">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Booking Created!</h2>
              <p className="text-gray-500 mt-1">Now complete your payment to confirm</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Bank Transfer Details</h3>
              <table className="w-full text-sm">
                <tbody className="space-y-1">
                  {[
                    ['Bank', 'Maybank'],
                    ['Account Name', 'Celebes Explorer Sdn Bhd'],
                    ['Account Number', '5642 1234 5678'],
                    ['Amount', `RM ${calcTotal().toLocaleString()}`],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="py-1 text-gray-500 w-1/3">{k}</td>
                      <td className="py-1 font-medium text-gray-900">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-3">
                Please transfer the exact amount and use your booking reference as the payment note.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Upload Payment Receipt</h3>
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                receiptFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary bg-gray-50'
              }`}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={e => setReceiptFile(e.target.files?.[0] ?? null)}
                />
                {receiptFile ? (
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1" />
                    <p className="text-sm text-green-700 font-medium">{receiptFile.name}</p>
                    <p className="text-xs text-gray-400">Click to change</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Click to upload receipt</p>
                    <p className="text-xs text-gray-400">JPEG, PNG, PDF up to 5MB</p>
                  </div>
                )}
              </label>
            </div>

            <button
              onClick={handleReceiptUpload}
              disabled={!receiptFile || uploading || uploadDone}
              className="w-full flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/80 disabled:opacity-50 transition-colors"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {uploading ? 'Uploading...' : 'Submit Receipt & Complete Booking'}
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
