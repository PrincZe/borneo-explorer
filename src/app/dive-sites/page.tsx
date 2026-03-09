'use client';

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Fish, Anchor, Waves } from 'lucide-react'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'

const diveSites = [
  {
    id: 'barracuda-point',
    name: 'Barracuda Point',
    image: '/images/dive-sites/barracuda-point.webp',
    depth: '15-30m',
    maxDepth: 30,
    level: 'Advanced',
    description: 'Famous for its massive schools of barracudas forming tornado-like formations. Also frequent sightings of grey reef sharks, white tip sharks, and large schools of jackfish.',
    highlights: ['Barracuda tornados', 'Grey reef sharks', 'Strong currents', 'Wall diving']
  },
  {
    id: 'drop-off',
    name: 'South Point Drop-Off',
    image: '/images/dive-sites/drop-off.webp',
    depth: '20-40m',
    maxDepth: 40,
    level: 'Advanced',
    description: 'A dramatic wall dropping into the abyss. Known for hammerhead shark sightings and large pelagic species. Strong currents make this an exciting dive for experienced divers.',
    highlights: ['Hammerhead sharks', 'Eagle rays', 'Deep wall', 'Pelagic species']
  },
  {
    id: 'turtle-cave',
    name: 'Turtle Cave',
    image: '/images/dive-sites/turtle-cave.webp',
    depth: '10-25m',
    maxDepth: 25,
    level: 'Advanced',
    description: 'Named for its resident green and hawksbill turtles. Features a cave system and vibrant coral gardens. Perfect for underwater photography.',
    highlights: ['Sea turtles', 'Cave formations', 'Coral gardens', 'Macro life']
  },
  {
    id: 'mid-reef',
    name: 'Mid Reef',
    image: '/images/dive-sites/mid-reef.webp',
    depth: '5-20m',
    maxDepth: 20,
    level: 'Advanced',
    description: 'A ridge featuring pristine coral gardens and abundant marine life. Perfect for observing smaller reef species and occasional turtle encounters.',
    highlights: ['Coral gardens', 'Reef sharks', 'Turtles', 'Schooling fish']
  }
];

export default function DiveSites() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <AnimateOnScroll animation="fade-in">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sipadan Dive Sites</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore some of the world&apos;s most spectacular dive sites, featuring dramatic walls,
              pristine coral reefs, and abundant marine life
            </p>
          </div>
        </AnimateOnScroll>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          {[
            { icon: Fish, title: 'Marine Life', value: '3000+ Species' },
            { icon: Waves, title: 'Visibility', value: '20-30 meters' },
            { icon: Anchor, title: 'Max Depth', value: '40 meters' },
          ].map((stat, i) => (
            <AnimateOnScroll key={i} animation="slide-up" delay={i * 0.1}>
              <Card className="text-center p-6 card-hover">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold">{stat.title}</h3>
                <p className="text-gray-600">{stat.value}</p>
              </Card>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Dive Sites */}
        <div className="space-y-12">
          {diveSites.map((site, index) => (
            <AnimateOnScroll key={site.id} animation={index % 2 === 0 ? 'slide-left' : 'slide-right'}>
              <div id={site.id} className="scroll-mt-28">
                <Card className="overflow-hidden card-hover">
                  <div className={`grid md:grid-cols-2 gap-0 ${index % 2 !== 0 ? 'md:[direction:rtl]' : ''}`}>
                    <div className="relative h-64 md:h-auto min-h-[300px] img-zoom md:[direction:ltr]">
                      <Image
                        src={site.image}
                        alt={site.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-8 md:[direction:ltr]">
                      <h2 className="text-2xl font-bold mb-3">{site.name}</h2>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                          Depth: {site.depth}
                        </span>
                        <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                          Level: {site.level}
                        </span>
                      </div>
                      {/* Depth indicator bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>0m</span>
                          <span>40m</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full ocean-gradient rounded-full transition-all duration-700"
                            style={{ width: `${(site.maxDepth / 40) * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{site.description}</p>
                      <h3 className="font-bold mb-2">Highlights:</h3>
                      <ul className="grid grid-cols-2 gap-2">
                        {site.highlights.map((highlight, hi) => (
                          <li key={hi} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                            <span className="text-sm">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Marine Life Section */}
        <AnimateOnScroll animation="slide-up">
          <div className="mt-16 bg-primary/5 rounded-xl p-8 border border-primary/10">
            <h2 className="text-3xl font-bold mb-8">Marine Life</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Large Pelagics', items: ['Hammerhead sharks', 'Grey reef sharks', 'Eagle rays', 'Barracudas', 'Giant trevallies'] },
                { title: 'Reef Residents', items: ['Green turtles', 'Hawksbill turtles', 'Bumphead parrotfish', 'Napoleon wrasse', 'Various reef fish'] },
                { title: 'Macro Life', items: ['Nudibranchs', 'Pygmy seahorses', 'Leaf scorpionfish', 'Mantis shrimp', 'Various crustaceans'] },
              ].map((category, i) => (
                <div key={i}>
                  <h3 className="font-bold mb-3 text-primary">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.items.map((item, j) => (
                      <li key={j} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* CTA */}
        <AnimateOnScroll animation="scale-up">
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-4">Ready to Dive Sipadan?</h2>
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
  )
}
