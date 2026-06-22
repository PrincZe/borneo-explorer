import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-[hsl(200,25%,15%)] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-4">Celebes Explorer</h3>
            <p className="text-white/60 text-sm leading-relaxed">Malaysia&apos;s premier Sipadan liveaboard vessel, offering exclusive diving experiences at the world&apos;s top dive sites.</p>
            <div className="flex space-x-3 mt-5">
              <a
                href="https://facebook.com/celebesexplorer"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-accent transition-colors duration-200"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/celebesexplorer"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-accent transition-colors duration-200"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Packages</h3>
            <ul className="space-y-2.5">
              <li><Link href="/diving-packages#day-trip" className="text-white/60 hover:text-white text-sm transition-colors">Day Trip</Link></li>
              <li><Link href="/diving-packages#1d1n" className="text-white/60 hover:text-white text-sm transition-colors">1D1N Liveaboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Explore</h3>
            <ul className="space-y-2.5">
              <li><Link href="/the-vessel" className="text-white/60 hover:text-white text-sm transition-colors">The Vessel</Link></li>
              <li><Link href="/dive-sites" className="text-white/60 hover:text-white text-sm transition-colors">Dive Sites</Link></li>
              <li><Link href="/getting-here" className="text-white/60 hover:text-white text-sm transition-colors">Getting Here</Link></li>
              <li><Link href="/book" className="text-white/60 hover:text-white text-sm transition-colors">Book Now</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Contact</h3>
            <div className="space-y-3">
              <a href="tel:+60123456789" className="flex items-center space-x-2.5 text-white/60 hover:text-white text-sm transition-colors">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+60 12 345 6789</span>
              </a>
              <a href="mailto:info@celebesexplorer.com" className="flex items-center space-x-2.5 text-white/60 hover:text-white text-sm transition-colors">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@celebesexplorer.com</span>
              </a>
              <div className="flex items-center space-x-2.5 text-white/60 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Semporna, Sabah, Malaysia</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-white/40 text-sm">&copy; 2025 MV Celebes Explorer. All rights reserved.</p>
            <p className="text-xs text-white/30">PADI 5 Star Dive Operator · Licensed Sipadan Permit Holder</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
