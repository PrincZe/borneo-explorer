'use client'

import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import Header from './Header'
import Footer from './Footer'
import RefTracker from './RefTracker'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      <Suspense fallback={null}>
        <RefTracker />
      </Suspense>
      {!isAdmin && <Header />}
      <main>{children}</main>
      {!isAdmin && <Footer />}
    </>
  )
}
