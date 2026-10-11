'use client'

import { readConsent } from '@/components/site/consent'

// Conversion tracking (capture/07 §7): form_start, form_submit, audit_request, estimator_complete,
// call_click, whatsapp_click (chat_lead follows with the chatbot). Events are pushed ONLY after the
// visitor accepted cookies; without consent nothing is written to dataLayer or sent to GA.

type Params = Record<string, string | number | boolean | undefined>

type TrackWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }

export type TrackEvent =
  | 'form_start'
  | 'form_submit'
  | 'estimator_complete'
  | 'audit_request'
  | 'chat_lead'
  | 'call_click'
  | 'whatsapp_click'

export function trackEvent(event: TrackEvent, params: Params = {}) {
  if (typeof window === 'undefined' || readConsent() !== 'accepted') return
  const w = window as TrackWindow
  w.dataLayer = w.dataLayer ?? []
  w.dataLayer.push({ event, ...params })
  // Plain GA4 (no GTM) listens to gtag(), not to dataLayer objects.
  if (typeof w.gtag === 'function') w.gtag('event', event, params)
}

// A form that redirects to /thank-you/ leaves the event for that page to fire (see ConversionEvents),
// so it is not lost while the browser navigates.
const PENDING_KEY = 'pentox_pending_event'

export function rememberConversion(event: TrackEvent, params: Params = {}) {
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify({ event, params }))
  } catch {
    trackEvent(event, params) // storage blocked: fire now
  }
}

export function flushConversion() {
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY)
    if (!raw) return
    window.sessionStorage.removeItem(PENDING_KEY)
    const { event, params } = JSON.parse(raw) as { event: TrackEvent; params: Params }
    trackEvent(event, params)
  } catch {
    // nothing pending, or storage unavailable
  }
}

// --- first-touch attribution -------------------------------------------------------------------
// The first visit's UTM tags, referrer and landing page are kept in a first-party cookie for 90 days
// and sent with every lead, so a lead is credited to the channel that first brought the visitor.

const COOKIE = 'pentox_ft'
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

export type FirstTouch = {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  referrer?: string
  landingPage?: string
}

const clip = (value: string | null | undefined, max = 200) => value?.slice(0, max) || undefined

function readCookie(): FirstTouch | undefined {
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${COOKIE}=`))
  if (!match) return undefined
  try {
    return JSON.parse(decodeURIComponent(match.slice(COOKIE.length + 1))) as FirstTouch
  } catch {
    return undefined
  }
}

export function captureFirstTouch() {
  if (readCookie()) return
  const params = new URLSearchParams(window.location.search)
  const [utmSource, utmMedium, utmCampaign, utmTerm, utmContent] = UTM_KEYS.map((key) => clip(params.get(key)))
  let referrer: string | undefined
  try {
    const ref = document.referrer ? new URL(document.referrer) : undefined
    // Only external referrers count; internal navigation is not a source.
    referrer = ref && ref.hostname !== window.location.hostname ? clip(ref.origin + ref.pathname, 500) : undefined
  } catch {
    referrer = undefined
  }
  const touch: FirstTouch = {
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    referrer,
    landingPage: clip(window.location.pathname + window.location.search, 500),
  }
  const value = encodeURIComponent(JSON.stringify(touch))
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE}=${value}; Max-Age=${90 * 24 * 60 * 60}; Path=/; SameSite=Lax${secure}`
}

/** JSON string for the hidden `attribution` field (empty object when there is no cookie). */
export const attributionJson = () => JSON.stringify(readCookie() ?? {})
