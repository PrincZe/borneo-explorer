'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Plane, Car, Ship, Hotel, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';

const Map = dynamic(() => import('../components/Maps'), {
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
  ssr: false
});

export default function GettingHere() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <AnimateOnScroll animation="fade-in">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How to Get Here</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your journey to world-class diving starts with a scenic trip to Semporna
            </p>
          </div>
        </AnimateOnScroll>

        {/* Timeline Journey */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block" />

            {[
              {
                icon: Plane,
                step: 'Step 1',
                title: 'Fly to Tawau',
                time: 'Various flight times',
                content: 'Tawau Airport (TWU) is the gateway to Sipadan. Regular flights available from:',
                items: [
                  'Kuala Lumpur (KUL) - Multiple daily flights by Malaysia Airlines, AirAsia',
                  'Kota Kinabalu (BKI) - Frequent connections available',
                  'International connections via Kota Kinabalu or Kuala Lumpur',
                ],
              },
              {
                icon: Car,
                step: 'Step 2',
                title: 'Transfer to Semporna',
                time: '~1.5 hours',
                content: 'From Tawau Airport to Semporna:',
                items: [
                  'Private transfer service (recommended) - We can arrange this for you',
                  'Shared minivan service - Regular departures throughout the day',
                  'Taxi service available at the airport',
                ],
              },
              {
                icon: Ship,
                step: 'Step 3',
                title: 'Board MV Celebes Explorer',
                time: 'Scheduled departure',
                content: 'Meet at Semporna jetty to board the vessel:',
                items: [
                  'Our crew will meet you at the designated meeting point',
                  'Safety briefing and vessel orientation upon boarding',
                  'Settle into your cabin and prepare for your diving adventure',
                ],
              },
            ].map((step, i) => (
              <AnimateOnScroll key={i} animation="slide-up" delay={i * 0.15}>
                <div className="relative flex gap-6 mb-8">
                  {/* Timeline dot */}
                  <div className="hidden md:flex flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 items-center justify-center z-10">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <Card className="flex-1 card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3 md:hidden">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <step.icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-primary">{step.step}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl md:text-2xl font-bold">{step.title}</h2>
                        <span className="flex items-center text-sm text-gray-500 gap-1">
                          <Clock className="h-4 w-4" />
                          {step.time}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{step.content}</p>
                      <ul className="space-y-2">
                        {step.items.map((item, j) => (
                          <li key={j} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>

        {/* Transfer Options */}
        <AnimateOnScroll animation="fade-in">
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Transfer Options & Tips</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Car,
                  title: 'Private Transfer',
                  price: 'From MYR 200',
                  desc: 'Door-to-door comfort. We can arrange a private vehicle to pick you up from Tawau Airport directly to Semporna jetty.',
                  recommended: true,
                },
                {
                  icon: Car,
                  title: 'Shared Minivan',
                  price: 'From MYR 50',
                  desc: 'Budget-friendly option with regular departures. Shared with other passengers heading to Semporna.',
                  recommended: false,
                },
                {
                  icon: Car,
                  title: 'Airport Taxi',
                  price: 'From MYR 150',
                  desc: 'Available at Tawau Airport taxi stand. Negotiate the fare before departure.',
                  recommended: false,
                },
              ].map((option, i) => (
                <AnimateOnScroll key={i} animation="scale-up" delay={i * 0.1}>
                  <Card className={`p-6 card-hover relative ${option.recommended ? 'ring-2 ring-accent' : ''}`}>
                    {option.recommended && (
                      <span className="absolute -top-3 left-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                    <option.icon className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-bold text-lg mb-1">{option.title}</h3>
                    <p className="text-accent font-semibold text-sm mb-2">{option.price}</p>
                    <p className="text-gray-600 text-sm">{option.desc}</p>
                  </Card>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* Accommodation Tips */}
        <AnimateOnScroll animation="slide-up">
          <div className="bg-primary/5 rounded-xl p-8 mb-16 border border-primary/10">
            <div className="flex items-center space-x-3 mb-4">
              <Hotel className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Accommodation Tips</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-2 text-primary">Before Your Trip</h3>
                <p className="text-gray-600 text-sm mb-3">
                  If your flight arrives the day before departure, we recommend staying overnight in Semporna.
                  Several comfortable hotels are available near the jetty.
                </p>
                <ul className="space-y-1">
                  {['Sipadan Inn', 'Seafest Hotel', 'Scuba Tiger Resort'].map((h, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-2 text-primary">After Your Trip</h3>
                <p className="text-gray-600 text-sm">
                  If your return flight departs the next day, the same hotels offer comfortable stays.
                  We can help arrange your post-trip accommodation and airport transfer upon request.
                </p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Map Section */}
        <AnimateOnScroll animation="fade-in">
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Location & Route</h2>
            <div className="rounded-xl overflow-hidden shadow-md">
              <Map />
            </div>
          </div>
        </AnimateOnScroll>

        {/* CTA */}
        <AnimateOnScroll animation="scale-up">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Need Help Planning Your Journey?</h2>
            <p className="text-xl text-gray-600 mb-8">Contact us and we&apos;ll help arrange your transfers</p>
            <Link
              href="/contact"
              className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all duration-300 hover:scale-105 inline-block"
            >
              Contact Us
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  )
}
