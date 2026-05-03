'use client'

import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import Header from './Header'
import Footer from './Footer'
import RefTracker from './RefTracker'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isAccount = pathname.startsWith('/account')
  const hideChrome = isAdmin || isAccount

  return (
    <>
      <Suspense fallback={null}>
        <RefTracker />
      </Suspense>
      {!hideChrome && <Header />}
      <main>{children}</main>
      {!hideChrome && <Footer />}
    </>
  )
}
