'use client';

import Image from 'next/image'
import Link from 'next/link'
import { Ship, Users, Bath, Camera, Utensils, Wifi, Shield, Anchor } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'

export default function VesselContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with parallax-style effect */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0" style={{ transform: 'translateZ(0)' }}>
          <Image
            src="/images/vessel.webp"
            alt="MV Celebes Explorer"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-black/30 to-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">MV Celebes Explorer</h1>
            <p className="text-xl md:text-2xl text-blue-100 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              Your premium liveaboard vessel for Sipadan
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-12 relative z-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Ship, title: 'Length', value: '35 meters' },
            { icon: Users, title: 'Capacity', value: '10 divers' },
            { icon: Bath, title: 'Cabins', value: '5 en-suite' },
            { icon: Camera, title: 'Camera Room', value: 'Dedicated space' },
          ].map((stat, i) => (
            <AnimateOnScroll key={i} animation="scale-up" delay={i * 0.1}>
              <Card className="p-6 text-center card-hover bg-white shadow-md">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold">{stat.title}</h3>
                <p className="text-gray-600">{stat.value}</p>
              </Card>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Facilities */}
        <AnimateOnScroll animation="fade-in">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Vessel Facilities</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <AnimateOnScroll animation="slide-left">
                <Card className="p-8 card-hover h-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Anchor className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Diving Facilities</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Spacious dive deck with individual gear storage',
                      'Nitrox available',
                      'Dedicated camera room with charging stations',
                      'Fresh water rinse tanks',
                      'Emergency oxygen and first aid equipment',
                      'Professional dive guides',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </AnimateOnScroll>
              <AnimateOnScroll animation="slide-right">
                <Card className="p-8 card-hover h-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Wifi className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Comfort & Leisure</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Air-conditioned saloon and cabins',
                      'En-suite bathrooms in all cabins',
                      'Indoor and outdoor dining areas',
                      'Sun deck with loungers',
                      'WiFi available when in range',
                      'Entertainment system in saloon',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </AnimateOnScroll>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Cabins */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Accommodation</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <AnimateOnScroll animation="slide-left">
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg img-zoom">
                <Image
                  src="/images/cabin.webp"
                  alt="Cabin Interior"
                  fill
                  className="object-cover"
                />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="slide-right">
              <h3 className="text-xl font-bold mb-4">Comfortable Cabins</h3>
              <p className="text-gray-600 mb-4">
                Our vessel features 5 air-conditioned cabins, each with en-suite bathrooms.
                All cabins are designed for comfort after long days of diving, with:
              </p>
              <ul className="space-y-2">
                {[
                  'Premium mattresses and linens',
                  'Individual climate control',
                  'Storage space for personal items',
                  'Daily housekeeping service',
                  'Fresh towels provided daily',
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
          </div>
        </div>

        {/* Safety */}
        <AnimateOnScroll animation="slide-up">
          <div className="bg-primary/5 rounded-xl p-8 mb-16 border border-primary/10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Safety Equipment</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-3 text-primary">Navigation & Communication</h3>
                <ul className="space-y-2">
                  {['GPS navigation system', 'Radar', 'Satellite communication', 'Emergency position indicating radio beacon'].map((item, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3 text-primary">Emergency Equipment</h3>
                <ul className="space-y-2">
                  {['Life rafts', 'Emergency oxygen units', 'First aid kits', 'DAN emergency assistance'].map((item, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {/* CTA */}
        <AnimateOnScroll animation="scale-up">
          <div className="text-center pb-16">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience Sipadan?</h2>
            <p className="text-xl text-gray-600 mb-8">Book your liveaboard adventure today</p>
            <Link
              href="/diving-packages"
              className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all duration-300 hover:scale-105 inline-block"
            >
              View Packages
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
