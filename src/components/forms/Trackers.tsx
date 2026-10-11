'use client'

import { useEffect } from 'react'

import { captureFirstTouch, flushConversion, trackEvent } from '@/lib/track'

/** Stores the first-touch cookie (UTMs, referrer, landing page) on the visitor's first page view. */
export function AttributionTracker() {
  useEffect(() => {
    captureFirstTouch()
  }, [])
  return null
}

/** call_click / whatsapp_click for every tel: and WhatsApp link on the site (needs cookie consent). */
export function ClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href]')
      const href = link?.getAttribute('href') ?? ''
      if (href.startsWith('tel:')) trackEvent('call_click', { location: window.location.pathname })
      else if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) {
        trackEvent('whatsapp_click', { location: window.location.pathname })
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}

/** On /thank-you/: fires the conversion event the form left behind (form_submit or audit_request). */
export function ConversionEvents() {
  useEffect(() => {
    flushConversion()
  }, [])
  return null
}
