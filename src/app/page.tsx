'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Fish, Ship, Award, Star } from 'lucide-react'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'
import { WaveDivider } from '@/components/ui/wave-divider'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <Image
          src="/images/sipadan-hero.webp"
          alt="Sipadan diving experience"
          sizes="100vw"
          priority
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-primary/60" />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="hero-particle"
            style={{
              left: `${15 + i * 15}%`,
              animationDuration: `${8 + i * 2}s`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDuration: '0.8s' }}>
              Dive Sipadan&apos;s Legendary Waters
            </h1>
            <p className="text-xl md:text-2xl mb-10 animate-fade-in opacity-0" style={{ animationDelay: '0.3s', animationDuration: '0.8s', animationFillMode: 'both' }}>
              Experience world-class diving at Sipadan&apos;s most spectacular sites aboard MV Celebes Explorer
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in opacity-0" style={{ animationDelay: '0.6s', animationDuration: '0.8s', animationFillMode: 'both' }}>
              <Link href="/diving-packages" className="bg-accent text-white px-8 py-4 rounded-full font-bold hover:bg-accent/80 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center space-x-2">
                <span>View Packages</span>
                <span className="text-lg">→</span>
              </Link>
              <Link href="/availability" className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold hover:bg-white/30 transition-all duration-300 border border-white/30 inline-flex items-center justify-center">
                Check Availability
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/70 rounded-full animate-slide-up" style={{ animationDuration: '1.5s', animationIterationCount: 'infinite' }} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Fish, title: 'Guaranteed Sipadan Permits', desc: 'We secure your Sipadan diving permits, ensuring access to world-renowned dive sites.' },
              { icon: Ship, title: 'Premium Liveaboard', desc: 'Comfortable accommodations and professional crew aboard our dedicated diving vessel.' },
              { icon: Award, title: 'Expert Dive Guides', desc: "PADI-certified guides with extensive knowledge of Sipadan's marine life and diving conditions." },
            ].map((feature, i) => (
              <AnimateOnScroll key={i} animation="slide-up" delay={i * 0.15}>
                <div className="text-center card-hover rounded-xl p-8 bg-white border border-gray-100 shadow-sm">
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimateOnScroll animation="fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Featured Diving Packages</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Choose the perfect adventure for your diving experience</p>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { img: '/images/package-4d3n.webp', title: '4D3N Sipadan Cruise', desc: '9 dives in Sipadan - perfect for a long weekend getaway.', price: 'From SGD 1,088 per person', href: '/diving-packages#4d3n', popular: false },
              { img: '/images/package-5d4n.webp', title: '5D4N Sipadan Adventure', desc: 'Extended cruise with more dive time at each site.', price: 'From SGD 1,585 per person', href: '/diving-packages#5d4n', popular: true },
              { img: '/images/package-charter.webp', title: 'Private Charter', desc: 'Exclusive vessel charter for groups up to 10 divers.', price: 'From SGD 14,540 total', href: '/diving-packages#charter', popular: false },
            ].map((pkg, i) => (
              <AnimateOnScroll key={i} animation="slide-up" delay={i * 0.15}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover relative">
                  {pkg.popular && (
                    <div className="absolute top-4 right-4 z-10 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="relative h-48 img-zoom">
                    <Image
                      src={pkg.img}
                      alt={pkg.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{pkg.title}</h3>
                    <p className="text-gray-600 mb-4">{pkg.desc}</p>
                    <p className="text-accent font-bold mb-4">{pkg.price}</p>
                    <Link href={pkg.href} className="text-primary font-semibold hover:text-accent transition-colors">
                      Learn more →
                    </Link>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Highlights */}
      <section className="relative">
        <WaveDivider color="fill-[hsl(201,100%,36%)]" />
        <div className="water-pattern py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '100+', label: 'Species of Coral' },
                { value: '3000+', label: 'Fish Species' },
                { value: '20m+', label: 'Visibility' },
                { value: '12', label: 'Dives per Trip' },
              ].map((stat, i) => (
                <AnimateOnScroll key={i} animation="scale-up" delay={i * 0.1}>
                  <div>
                    <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                    <div className="text-blue-200">{stat.label}</div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
        <WaveDivider color="fill-white" flip />
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimateOnScroll animation="fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Divers Say</h2>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { quote: "Incredible diving experience! The hammerhead sharks at South Point and the barracuda tornado at Barracuda Point were unforgettable. Professional crew and comfortable accommodation.", name: 'Marcus L.', title: 'Advanced Open Water Diver', stars: 5 },
              { quote: "As an underwater photographer, I couldn't ask for better dive sites. The crew knew exactly where to find the best marine life and the visibility was exceptional.", name: 'Sarah K.', title: 'PADI Divemaster', stars: 5 },
            ].map((testimonial, i) => (
              <AnimateOnScroll key={i} animation={i === 0 ? 'slide-left' : 'slide-right'}>
                <div className="bg-gray-50 rounded-xl p-8 relative card-hover border border-gray-100">
                  <div className="text-6xl text-primary/10 font-serif absolute top-4 left-6">&ldquo;</div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.stars)].map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic relative z-10">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative">
        <WaveDivider color="fill-[hsl(201,100%,36%)]" />
        <div className="ocean-gradient py-20 text-white text-center">
          <div className="container mx-auto px-4">
            <AnimateOnScroll animation="scale-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore Sipadan?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Secure your spot on our next diving expedition</p>
              <Link href="/book-now" className="bg-white text-primary px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-all duration-300 hover:scale-105 inline-block">
                Book Your Dive Trip
              </Link>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </div>
  )
}
