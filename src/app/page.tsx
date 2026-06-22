'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Fish, Ship, Award, Star, Waves, Anchor } from 'lucide-react'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'
import HeroSearch from './components/HeroSearch'
import { useCurrency } from '@/components/CurrencyProvider'

export default function Home() {
  const { formatPrice } = useCurrency()
  return (
    <div>
      {/* Hero Section — full viewport, organic overlay */}
      <section className="relative h-screen overflow-hidden">
        <Image
          src="/images/sipadan-hero.webp"
          alt="Sipadan diving experience"
          sizes="100vw"
          priority
          fill
          className="object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[hsl(195,85%,32%)]/70" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <p className="text-sm md:text-base uppercase tracking-[0.3em] text-white/80 mb-4 animate-fade-in" style={{ animationDuration: '0.8s' }}>
              MV Celebes Explorer · Sipadan, Borneo
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in leading-tight" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }}>
              Dive into Paradise
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationDuration: '0.8s', animationFillMode: 'both' }}>
              World-class liveaboard diving at one of the ocean&apos;s most extraordinary destinations
            </p>
            <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.6s', animationDuration: '0.8s', animationFillMode: 'both' }}>
              <HeroSearch />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/60 rounded-full animate-slide-up" style={{ animationDuration: '1.5s', animationIterationCount: 'infinite' }} />
          </div>
        </div>
      </section>

      {/* Value Props — warm sand background */}
      <section className="py-24 sand-texture">
        <div className="container mx-auto px-4">
          <AnimateOnScroll animation="fade-in">
            <p className="text-center text-accent font-semibold uppercase tracking-wider text-sm mb-3">Why Dive With Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">An experience like no other</h2>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Fish, title: 'Guaranteed Sipadan Permits', desc: 'We secure your Sipadan diving permits so you can focus on the dive of a lifetime.' },
              { icon: Ship, title: 'Premium Liveaboard', desc: 'Comfortable cabins, fresh meals, and a professional crew dedicated to your experience.' },
              { icon: Award, title: 'Expert Dive Guides', desc: 'PADI-certified guides who know every current, critter, and coral formation by heart.' },
            ].map((feature, i) => (
              <AnimateOnScroll key={i} animation="slide-up" delay={i * 0.15}>
                <div className="text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Packages — clean white */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <AnimateOnScroll animation="fade-in">
            <p className="text-center text-accent font-semibold uppercase tracking-wider text-sm mb-3">Our Packages</p>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">Choose Your Adventure</h2>
            <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">Simple, all-inclusive pricing. Just pick your trip and dive.</p>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {[
              { img: '/images/package-4d3n.webp', title: 'Day Trip', dives: '3 dives', desc: 'Full-day diving at Sipadan with lunch and all permits included.', priceMYR: 1300, href: '/diving-packages#day-trip', popular: false },
              { img: '/images/package-5d4n.webp', title: '1D1N Liveaboard', dives: '5 dives', desc: 'Overnight aboard with sunset, night dive, and sunrise sessions.', priceMYR: 1500, href: '/diving-packages#1d1n', popular: true },
            ].map((pkg, i) => (
              <AnimateOnScroll key={i} animation="slide-up" delay={i * 0.15}>
                <div className="group rounded-2xl overflow-hidden bg-white border border-border shadow-sm hover:shadow-xl transition-all duration-300 relative">
                  {pkg.popular && (
                    <div className="absolute top-4 right-4 z-10 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      Popular
                    </div>
                  )}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={pkg.img}
                      alt={pkg.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1 rounded-full">{pkg.dives}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1 text-foreground">{pkg.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{pkg.desc}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">{formatPrice(pkg.priceMYR)}</p>
                        <p className="text-xs text-muted-foreground">per person</p>
                      </div>
                      <Link href={pkg.href} className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Stats — tropical gradient band */}
      <section className="tropical-divider py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100+', label: 'Coral Species' },
              { value: '3000+', label: 'Fish Species' },
              { value: '20m+', label: 'Visibility' },
              { value: '5', label: 'Dives per Trip' },
            ].map((stat, i) => (
              <AnimateOnScroll key={i} animation="scale-up" delay={i * 0.1}>
                <div>
                  <div className="text-4xl md:text-5xl font-bold mb-1">{stat.value}</div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 sand-texture">
        <div className="container mx-auto px-4">
          <AnimateOnScroll animation="fade-in">
            <p className="text-center text-accent font-semibold uppercase tracking-wider text-sm mb-3">Diver Stories</p>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-foreground">Memories That Last a Lifetime</h2>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { quote: "The hammerhead sharks at South Point and the barracuda tornado were unforgettable. Professional crew and surprisingly comfortable accommodation.", name: 'Marcus L.', title: 'Advanced Open Water', stars: 5 },
              { quote: "As an underwater photographer, I couldn't ask for better. The crew knew exactly where to find the best marine life and visibility was exceptional.", name: 'Sarah K.', title: 'PADI Divemaster', stars: 5 },
            ].map((testimonial, i) => (
              <AnimateOnScroll key={i} animation={i === 0 ? 'slide-left' : 'slide-right'}>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-border relative">
                  <div className="text-6xl text-primary/10 font-serif absolute top-4 left-6">&ldquo;</div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.stars)].map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-5 italic relative z-10 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="/images/sipadan-hero.webp"
          alt="Underwater scene"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[hsl(195,85%,32%)]/85" />
        <div className="relative container mx-auto px-4 text-center text-white">
          <AnimateOnScroll animation="scale-up">
            <Anchor className="w-10 h-10 mx-auto mb-6 text-white/60" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore Sipadan?</h2>
            <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">Secure your spot on our next diving expedition. Limited permits available.</p>
            <Link href="/book" className="inline-block bg-accent text-white px-8 py-4 rounded-xl font-bold hover:bg-accent/90 transition-all duration-300 hover:scale-105 shadow-lg">
              Book Your Dive Trip
            </Link>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  )
}
