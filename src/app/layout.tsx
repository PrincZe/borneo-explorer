import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import PublicShell from './components/PublicShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Celebes Explorer - Sipadan Liveaboard Diving',
  description: 'Experience world-class diving in Sipadan aboard MV Celebes Explorer. Exclusive liveaboard packages with guaranteed Sipadan permits.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  )
}