import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import React from 'react'

import { AttributionTracker, ClickTracker } from '@/components/forms/Trackers'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { Analytics } from '@/components/site/Analytics'
import { BackToTop } from '@/components/site/BackToTop'
import { BackgroundShapes } from '@/components/site/BackgroundShapes'
import { CookieConsent } from '@/components/site/CookieConsent'
import { MobileStickyBar } from '@/components/site/MobileStickyBar'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { WhatsAppButton } from '@/components/site/WhatsAppButton'
import { getChatWidgetConfig } from '@/lib/chatbot/public'
import { env } from '@/lib/env'
import { getFooterInfo, getHeaderInfo, getSiteInfo, stickyActions } from '@/lib/site-data'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, header, footer, chat] = await Promise.all([getSiteInfo(), getHeaderInfo(), getFooterInfo(), getChatWidgetConfig()])

  const actions = stickyActions(site, header)
  // The banner only exists when there is something to consent to.
  const analyticsEnabled = Boolean(site.analytics.ga4Id || site.analytics.gtmId || site.analytics.clarityId)

  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-navy focus:shadow-lg"
          href="#main"
        >
          Skip to content
        </a>
        <BackgroundShapes />
        <SiteHeader header={header} site={site} />
        <main className="flex-1 outline-none" id="main" tabIndex={-1}>
          {children}
        </main>
        {/* Bottom padding keeps the footer clear of the mobile sticky bar. */}
        <div className={actions.length ? 'pb-14 md:pb-0' : undefined}>
          <SiteFooter analyticsEnabled={analyticsEnabled} footer={footer} site={site} />
        </div>
        <WhatsAppButton whatsapp={site.whatsapp} />
        <BackToTop raised={Boolean(chat)} />
        {chat && <ChatWidget config={chat} hasStickyBar={actions.length > 0} whatsappHref={site.whatsapp?.href} />}
        <AttributionTracker />
        <ClickTracker />
        <MobileStickyBar actions={actions} header={header} site={site} />
        {analyticsEnabled && (
          <>
            <CookieConsent />
            <Analytics ids={site.analytics} />
          </>
        )}
      </body>
    </html>
  )
}
