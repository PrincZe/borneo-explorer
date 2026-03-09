'use client'

import Image from 'next/image'
import { Anchor, Heart, Shield } from 'lucide-react'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'

export default function About() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="ocean-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <AnimateOnScroll animation="fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Celebes Explorer</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your trusted partner for world-class Sipadan diving experiences
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <AnimateOnScroll animation="slide-left" className="md:w-1/2">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/images/vessel.webp"
                  alt="MV Celebes Explorer"
                  fill
                  className="object-cover"
                />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="slide-right" className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Celebes Explorer was born from a deep passion for the underwater world of Sipadan and the Celebes Sea.
                Based in Semporna, Sabah, we operate MV Celebes Explorer &mdash; a purpose-built liveaboard vessel designed
                to bring divers to the most spectacular dive sites in Malaysian Borneo.
              </p>
              <p className="text-gray-600 mb-4">
                With years of experience navigating these waters, our team has an intimate knowledge of Sipadan&apos;s
                dive sites, seasonal marine life patterns, and the best conditions for unforgettable underwater encounters.
              </p>
              <p className="text-gray-600">
                As licensed Sipadan permit holders, we guarantee our guests access to one of the world&apos;s top-rated
                dive destinations, ensuring every trip is a once-in-a-lifetime experience.
              </p>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimateOnScroll animation="fade-in">
            <h2 className="text-3xl font-bold mb-12 text-center">What Drives Us</h2>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Anchor,
                title: 'Expert Diving',
                desc: 'Our PADI-certified dive guides know every corner of Sipadan. With small group sizes (max 10 divers), we ensure personalized attention and safe, memorable dives at every site.'
              },
              {
                icon: Heart,
                title: 'Sustainable Tourism',
                desc: 'We are committed to preserving Sipadan\'s marine ecosystem. We follow strict environmental guidelines, practice responsible diving, and support local conservation efforts.'
              },
              {
                icon: Shield,
                title: 'Safety First',
                desc: 'Your safety is our top priority. MV Celebes Explorer is equipped with modern navigation, emergency oxygen, satellite communication, and DAN emergency assistance protocols.'
              },
            ].map((item, i) => (
              <AnimateOnScroll key={i} animation="slide-up" delay={i * 0.15}>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 card-hover text-center">
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* The Crew */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimateOnScroll animation="fade-in">
            <h2 className="text-3xl font-bold mb-4 text-center">Meet the Crew</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Our experienced team ensures every aspect of your journey is exceptional
            </p>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                role: 'Captain & Navigator',
                desc: 'Experienced captain with extensive knowledge of the Celebes Sea, ensuring safe passage to Sipadan and surrounding dive sites.',
                image: '/images/gallery/vessel/NIC_5577.jpg',
              },
              {
                role: 'Dive Guides',
                desc: 'PADI-certified professionals who know every dive site intimately. They\'ll guide you to the best marine life encounters.',
                image: '/images/gallery/diving/265259283_1027796784436002_3593878696376190890_n.jpg',
              },
              {
                role: 'Onboard Chef',
                desc: 'Our talented chef prepares fresh, delicious meals daily &mdash; from local Malaysian dishes to international favorites.',
                image: '/images/gallery/dining/Dinner3.jpeg',
              },
            ].map((member, i) => (
              <AnimateOnScroll key={i} animation="scale-up" delay={i * 0.15}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover border border-gray-100">
                  <div className="relative h-48 img-zoom">
                    <Image
                      src={member.image}
                      alt={member.role}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{member.role}</h3>
                    <p className="text-gray-600 text-sm">{member.desc}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Vessel Gallery Teaser */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <AnimateOnScroll animation="slide-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-40 rounded-lg overflow-hidden">
                  <Image src="/images/saloon.webp" alt="Saloon" fill className="object-cover" />
                </div>
                <div className="relative h-40 rounded-lg overflow-hidden">
                  <Image src="/images/cabin.webp" alt="Cabin" fill className="object-cover" />
                </div>
                <div className="relative h-40 rounded-lg overflow-hidden col-span-2">
                  <Image src="/images/dive-deck.webp" alt="Dive Deck" fill className="object-cover" />
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="slide-right">
              <h2 className="text-3xl font-bold mb-4">Life Aboard</h2>
              <p className="text-gray-600 mb-4">
                MV Celebes Explorer is designed for comfort between dives. With 5 en-suite cabins,
                a spacious air-conditioned saloon, sun deck, and a fully equipped dive deck,
                you&apos;ll feel right at home on the water.
              </p>
              <p className="text-gray-600 mb-6">
                Enjoy fresh meals prepared by our onboard chef, relax with panoramic ocean views,
                and prepare for your next dive in our dedicated camera room.
              </p>
              <a href="/the-vessel" className="text-primary font-semibold hover:text-accent transition-colors">
                Explore the vessel →
              </a>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </div>
  )
}
