import type { Metadata } from 'next'
import DiveSitesContent from './content'

export const metadata: Metadata = {
  title: 'Sipadan Dive Sites – 12 World-Class Dives | Celebes Explorer',
  description:
    'Explore all 12 dive sites around Sipadan Island — from the famous Barracuda Point tornado to the haunting Turtle Cavern. Interactive map, depth profiles, marine life guide and seasonal conditions for Malaysia\'s top-rated dive destination.',
  openGraph: {
    title: 'Sipadan Dive Sites – 12 World-Class Dives | Celebes Explorer',
    description:
      'Explore all 12 dive sites around Sipadan Island. Interactive map, depth profiles, marine life and seasonal conditions for Malaysia\'s premier dive destination.',
    type: 'website',
    url: 'https://liveaboardsipadan.com/dive-sites',
    images: [
      {
        url: '/images/dive-sites/barracuda-point.webp',
        width: 1200,
        height: 630,
        alt: 'Barracuda Point dive site at Sipadan Island with schooling barracuda',
      },
    ],
  },
}

export default function DiveSitesPage() {
  return <DiveSitesContent />
}
