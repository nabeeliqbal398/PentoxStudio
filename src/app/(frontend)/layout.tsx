import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import React from 'react'

import { env } from '@/lib/env'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'Pentox Studio',
    template: '%s | Pentox Studio',
  },
  description: 'Digital marketing, design and development agency in Lahore, Pakistan.',
  icons: { icon: '/brand/favicon.png' },
}

export const viewport: Viewport = {
  themeColor: '#1C244B',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
