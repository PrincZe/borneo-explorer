'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

// Reads ?ref=CODE from URL and stores in cookie for 7 days
// Runs silently on every page — enables affiliate tracking even if customer browses before booking
export default function RefTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && ref.trim()) {
      const code = ref.trim().toUpperCase()
      // 7-day cookie, accessible to all paths
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `ref_code=${code}; expires=${expires}; path=/; SameSite=Lax`
    }
  }, [searchParams])

  return null
}
