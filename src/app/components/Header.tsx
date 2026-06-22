'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Ship, Menu, X, User } from 'lucide-react'
import { CurrencySwitcher } from '@/components/CurrencyProvider'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Packages', path: '/diving-packages' },
    { name: 'The Vessel', path: '/the-vessel' },
    { name: 'Dive Sites', path: '/dive-sites' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Getting Here', path: '/getting-here' },
    { name: 'Book Now', path: '/book' },
    { name: 'Account', path: '/account' },
  ]

  const headerBg = isHome && !scrolled
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border/50'

  const textColor = isHome && !scrolled ? 'text-white' : 'text-foreground'

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className={`flex items-center space-x-2 group ${textColor}`}>
            <Ship className="h-7 w-7 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold">Celebes Explorer</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-0.5">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <Link href={item.path} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          item.name === 'Book Now'
                            ? 'bg-accent text-white hover:bg-accent/90 px-4'
                            : item.name === 'Account'
                              ? `${isHome && !scrolled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-muted hover:bg-muted/80 text-foreground'} flex items-center gap-1.5`
                              : pathname === item.path
                                ? `${isHome && !scrolled ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`
                                : `${isHome && !scrolled ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`
                        }`}
                      >
                        {item.name === 'Account' && <User className="w-3.5 h-3.5" />}
                        {item.name}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            <div className="ml-2">
              <CurrencySwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${isHome && !scrolled ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'}`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="mt-3 pt-3 border-t border-white/20">
            <div className="pb-3">
              <CurrencySwitcher />
            </div>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`block px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                      item.name === 'Book Now'
                        ? 'bg-accent text-white hover:bg-accent/90 text-center font-bold mt-2'
                        : item.name === 'Account'
                          ? `${isHome && !scrolled ? 'bg-white/10 text-white' : 'bg-muted text-foreground'} flex items-center gap-2`
                          : pathname === item.path
                            ? `${isHome && !scrolled ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`
                            : `${isHome && !scrolled ? 'text-white/80 hover:bg-white/10' : 'text-muted-foreground hover:bg-muted'}`
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name === 'Account' && <User className="w-4 h-4" />}
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
