import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react'
import { WaveDivider } from '@/components/ui/wave-divider'

const Footer = () => {
  return (
    <footer className="relative">
      <WaveDivider color="fill-[hsl(201,100%,25%)]" />
      <div className="text-white py-12" style={{ background: 'linear-gradient(135deg, hsl(201 100% 25%) 0%, hsl(183 100% 28%) 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Celebes Explorer</h3>
              <p className="text-blue-100">Malaysia&apos;s premier Sipadan liveaboard vessel, offering exclusive diving experiences at the world&apos;s top dive sites.</p>
              <div className="flex space-x-4 mt-4">
                <a
                  href="https://facebook.com/celebesexplorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent hover:scale-110 transition-all duration-200"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href="https://instagram.com/celebesexplorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent hover:scale-110 transition-all duration-200"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Packages</h3>
              <ul className="space-y-2">
                <li><Link href="/diving-packages#4d3n" className="text-blue-100 hover:text-white transition-colors">4D3N Sipadan Cruise</Link></li>
                <li><Link href="/diving-packages#5d4n" className="text-blue-100 hover:text-white transition-colors">5D4N Sipadan Adventure</Link></li>
                <li><Link href="/diving-packages#charter" className="text-blue-100 hover:text-white transition-colors">Private Charter</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-blue-100 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/the-vessel" className="text-blue-100 hover:text-white transition-colors">About Our Vessel</Link></li>
                <li><Link href="/dive-sites" className="text-blue-100 hover:text-white transition-colors">Dive Sites</Link></li>
                <li><Link href="/getting-here" className="text-blue-100 hover:text-white transition-colors">How to Get Here</Link></li>
                <li><Link href="/book" className="text-blue-100 hover:text-white transition-colors">Book Now</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <div className="space-y-3">
                <a href="tel:+60123456789" className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>+60 12 345 6789</span>
                </a>
                <a href="mailto:info@celebesexplorer.com" className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>info@celebesexplorer.com</span>
                </a>
                <div className="flex items-center space-x-2 text-blue-100">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>Semporna, Sabah, Malaysia</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; 2025 MV Celebes Explorer. All rights reserved.</p>
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-blue-100">PADI 5 Star Dive Operator | Licensed Sipadan Permit Holder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
