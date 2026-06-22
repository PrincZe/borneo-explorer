'use client';

import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'
import { useCurrency } from '@/components/CurrencyProvider'

const PACKAGES = [
  {
    id: 'day-trip',
    slug: 'day-trip',
    title: 'Day Trip',
    priceMYR: 1300,
    priceNote: 'per person',
    image: '/images/package-4d3n.webp',
    description: 'A full-day diving trip to Sipadan with 3 dives, perfect for those short on time.',
    popular: false,
    features: [
      ['3 guided dives', 'Lunch included', 'Sipadan permit included'],
      ['Marine park fees', 'Professional dive guide', 'Boat transfers'],
    ],
  },
  {
    id: '1d1n',
    slug: '1d1n-liveaboard',
    title: '1D1N Liveaboard',
    priceMYR: 1500,
    priceNote: 'per person',
    image: '/images/package-5d4n.webp',
    description: 'Overnight liveaboard experience with 5 dives including a night dive at Sipadan.',
    popular: true,
    features: [
      ['5 guided dives', 'All meals included', '1 night accommodation'],
      ['Sipadan permit included', 'Night dive', 'Marine park fees'],
    ],
  },
];

export default function DivingPackagesContent() {
  const { formatPrice, currency } = useCurrency()

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <AnimateOnScroll animation="fade-in">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sipadan Diving Packages</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience world-class diving with our exclusive Sipadan packages
            </p>
          </div>
        </AnimateOnScroll>

        {/* Packages */}
        <div className="space-y-12">
          {PACKAGES.map((pkg, index) => (
            <AnimateOnScroll key={pkg.id} animation={index % 2 === 0 ? 'slide-left' : 'slide-right'}>
              <div id={pkg.id} className="scroll-mt-28">
                <Card className={`overflow-hidden card-hover relative ${pkg.popular ? 'ring-2 ring-accent shadow-lg' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute top-4 left-4 z-10 bg-accent text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                      Most Popular
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative h-64 md:h-auto min-h-[300px] img-zoom">
                      <Image
                        src={pkg.image}
                        alt={pkg.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 md:p-8">
                      <h2 className="text-2xl font-bold mb-2">{pkg.title}</h2>
                      <p className="text-2xl font-bold text-accent mb-1">{formatPrice(pkg.priceMYR)}</p>
                      <p className="text-sm text-gray-500 mb-4">{pkg.priceNote}{currency !== 'MYR' && ' · Charged in MYR'}</p>
                      <p className="text-gray-600 mb-6">{pkg.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {pkg.features.map((col, ci) => (
                          <div key={ci} className="space-y-2">
                            {col.map((feature, fi) => (
                              <div key={fi} className="flex items-center space-x-2">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <Link href={`/book?packageSlug=${pkg.slug}`}>
                        <Button className={`w-full ${pkg.popular ? 'bg-accent hover:bg-accent/90' : ''}`}>
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Requirements Section */}
        <AnimateOnScroll animation="slide-up">
          <div className="bg-primary/5 rounded-xl p-8 mt-16 border border-primary/10">
            <h2 className="text-2xl font-bold mb-6">Important Information</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-3 text-primary">Requirements</h3>
                <ul className="space-y-2">
                  {['Advanced Open Water certification', 'Minimum 20 logged dives', 'Valid diving insurance'].map((req, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3 text-primary">Additional Services</h3>
                <ul className="space-y-2">
                  {['Nitrox available', 'Equipment rental available'].map((svc, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{svc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
