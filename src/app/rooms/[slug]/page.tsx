import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Users, Maximize2, BedDouble, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>
}

export default async function RoomDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { checkIn, checkOut } = await searchParams

  const supabase = await createClient()

  const { data: room, error } = await supabase
    .from('room_types')
    .select(`
      *,
      room_package_pricing(
        *,
        packages(*)
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !room) notFound()

  type PackagePricing = typeof room.room_package_pricing[0] & {
    packages: {
      id: string; name: string; slug: string; duration_days: number;
      num_dives: number | null; features: unknown; is_popular: boolean
    }
  }

  const pricingList = (room.room_package_pricing as PackagePricing[]).filter(rp => rp.is_available)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back navigation */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <Link href={`/rooms${checkIn ? `?checkIn=${checkIn}&checkOut=${checkOut}` : ''}`}
            className="flex items-center gap-2 text-primary hover:underline text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Cabins
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-5 gap-10">
          {/* Left: Details */}
          <div className="md:col-span-3">
            {/* Image placeholder */}
            <div className="rounded-2xl overflow-hidden h-64 bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center mb-6">
              <BedDouble className="w-24 h-24 text-primary/30" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h1>
            <p className="text-gray-600 text-lg mb-6">{room.description}</p>

            {/* Specs */}
            <div className="flex flex-wrap gap-6 mb-6 text-gray-700">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Up to <strong>{room.max_occupancy}</strong> guests</span>
              </span>
              {room.size_sqm && (
                <span className="flex items-center gap-2">
                  <Maximize2 className="w-5 h-5 text-primary" />
                  <span><strong>{room.size_sqm} m²</strong></span>
                </span>
              )}
              {room.bed_type && (
                <span className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-primary" />
                  <span><strong>{room.bed_type}</strong> bed</span>
                </span>
              )}
            </div>

            {/* Amenities */}
            {Array.isArray(room.amenities) && room.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Cabin Amenities</h2>
                <div className="grid grid-cols-2 gap-2">
                  {(room.amenities as string[]).map(a => (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Pricing */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Package</h2>

              <div className="space-y-3">
                {pricingList.map(rp => (
                  <div key={rp.id}
                    className={`border rounded-xl p-4 transition-colors ${
                      rp.packages.is_popular ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    {rp.packages.is_popular && (
                      <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full mb-2 inline-block">
                        Most Popular
                      </span>
                    )}
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900">{rp.packages.name}</h3>
                      <div className="text-right">
                        <div className="font-bold text-primary">SGD {(rp.price_override ?? 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">per person</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {rp.packages.duration_days}D/{rp.packages.duration_days - 1}N
                      {rp.packages.num_dives ? ` · ${rp.packages.num_dives} dives` : ''}
                    </div>
                    <Link
                      href={`/book?roomSlug=${slug}&packageSlug=${rp.packages.slug}${checkIn ? `&checkIn=${checkIn}&checkOut=${checkOut}` : ''}`}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary/80 transition-colors"
                    >
                      Book This Package <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>

              {checkIn && checkOut && (
                <p className="text-xs text-gray-400 mt-4 text-center">
                  {new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  {' → '}
                  {new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
