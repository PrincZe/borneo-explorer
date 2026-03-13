'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import type { RoomType, Package, AddOnOption } from '@/types/database'

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

  const roomSlug = searchParams.get('roomSlug') || ''
  const packageSlug = searchParams.get('packageSlug') || ''
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''

  const [step, setStep] = useState(1)
  const [rooms, setRooms] = useState<RoomType[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [addOns, setAddOns] = useState<AddOnOption[]>([])
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
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

  // Pre-select package from URL
  useEffect(() => {
    if (packageSlug && packages.length) {
      const pkg = packages.find(p => p.slug === packageSlug)
      if (pkg) setValue('package_id', pkg.id)
    }
  }, [packageSlug, packages, setValue])

  const selectedRoom = rooms.find(r => r.id === selectedRoomId)
  const selectedPackage = packages.find(p => p.id === selectedPackageId)

  function calcSubtotal() {
    const basePrice = selectedPackage?.price_per_person ?? 0
    const guests = watch('num_guests') ?? 1
    const addonTotal = addOns
      .filter(a => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0)
    return basePrice * guests + addonTotal
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

    if (checkIn && checkOut && checkOut <= checkIn) {
      customErrors.date = 'Check-out date must be after check-in date'
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
        .filter(a => selectedAddons.includes(a.id))
        .map(a => ({ id: a.id, name: a.name, price: a.price }))

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          add_ons: addOnItems,
          ...(promoData && promoStatus === 'valid' ? { promo_code: promoData.code } : {}),
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Booking failed')

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
      router.push(`/book/confirmation/${json.booking.booking_ref}`)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const steps = ['Trip Details', 'Your Info', 'Payment']

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Dive Trip</h1>
        <p className="text-gray-500 mb-8">Aboard MV Celebes Explorer</p>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
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

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Trip Details */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow p-6 space-y-5">
              <h2 className="text-xl font-bold text-gray-900">Trip Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Cabin <span className="text-red-500">*</span></label>
                <select {...register('room_type_id')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="">Choose a cabin...</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name} — {r.bed_type} bed</option>
                  ))}
                </select>
                {errors.room_type_id && <p className="text-red-500 text-sm mt-1">{errors.room_type_id.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Package <span className="text-red-500">*</span></label>
                <select {...register('package_id')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="">Choose a package...</option>
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — SGD {p.price_per_person.toLocaleString()}/person</option>
                  ))}
                </select>
                {errors.package_id && <p className="text-red-500 text-sm mt-1">{errors.package_id.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date <span className="text-red-500">*</span></label>
                  <input type="date" {...register('check_in_date')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent" />
                  {errors.check_in_date && <p className="text-red-500 text-sm mt-1">{errors.check_in_date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date <span className="text-red-500">*</span></label>
                  <input type="date" {...register('check_out_date')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent" />
                  {errors.check_out_date && <p className="text-red-500 text-sm mt-1">{errors.check_out_date.message}</p>}
                </div>
              </div>
              {step1Errors.date && <p className="text-red-500 text-sm">{step1Errors.date}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                <input type="number" min={1} max={10} {...register('num_guests', { valueAsNumber: true })}
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
                            setSelectedAddons(prev =>
                              e.target.checked ? [...prev, a.id] : prev.filter(x => x !== a.id)
                            )
                          }}
                          className="mt-0.5 w-4 h-4 accent-primary"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">{a.name}</span>
                            <span className="text-primary font-semibold">+SGD {a.price}</span>
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
                    ✓ Code applied — {promoData.discount_type === 'percent' ? `${promoData.discount_value}% off` : `SGD ${promoData.discount_value} off`}
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
                    <div className="flex justify-between"><span>Package</span><span>{selectedPackage.name}</span></div>
                    <div className="flex justify-between"><span>Guests</span><span>{watch('num_guests')}</span></div>
                    <div className="flex justify-between"><span>Base price</span><span>SGD {(selectedPackage.price_per_person * (watch('num_guests') ?? 1)).toLocaleString()}</span></div>
                    {selectedAddons.length > 0 && addOns.filter(a => selectedAddons.includes(a.id)).map(a => (
                      <div key={a.id} className="flex justify-between text-gray-500"><span>+ {a.name}</span><span>SGD {a.price}</span></div>
                    ))}
                    {promoStatus === 'valid' && promoData && calcDiscount(calcSubtotal()) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({promoData.code})</span>
                        <span>- SGD {calcDiscount(calcSubtotal()).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-primary text-base pt-2 border-t border-primary/20">
                      <span>Total</span><span>SGD {calcTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/80 disabled:opacity-50 transition-colors">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {submitting ? 'Creating Booking...' : 'Continue to Payment'}
                  {!submitting && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
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
                    ['Amount', `SGD ${calcTotal().toLocaleString()}`],
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
  )
}
