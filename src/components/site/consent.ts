'use client'

import { useSyncExternalStore } from 'react'

// Cookie-consent state, kept in localStorage and shared between the banner, the analytics
// loader and the footer's "Cookie settings" button. Analytics must read it through useConsent()
// and load nothing unless it is 'accepted'.

export type Consent = 'accepted' | 'rejected' | null

const KEY = 'pentox_consent'

const listeners = new Set<() => void>()
let reopened = false
let memory: Consent = null // used when localStorage is unavailable (private mode, blocked storage)

const emit = () => listeners.forEach((listener) => listener())

function read(): Consent {
  try {
    const value = window.localStorage.getItem(KEY)
    if (value === 'accepted' || value === 'rejected') return value
    return null
  } catch {
    return memory
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

export function setConsent(value: 'accepted' | 'rejected') {
  const previous = read()
  memory = value
  try {
    window.localStorage.setItem(KEY, value)
  } catch {
    // storage blocked: the in-memory value still applies for this page view
  }
  reopened = false
  emit()
  // Scripts that were already loaded can't be unloaded, so a withdrawal needs a fresh page.
  if (previous === 'accepted' && value === 'rejected') window.location.reload()
}

export function reopenConsent() {
  reopened = true
  emit()
}

/** 'pending' during server render and hydration, so nothing flashes or loads too early. */
export function useConsent(): Consent | 'pending' {
  return useSyncExternalStore(subscribe, read, () => 'pending' as const)
}

export function useConsentBannerOpen(): boolean {
  const consent = useConsent()
  const wasReopened = useSyncExternalStore(
    subscribe,
    () => reopened,
    () => false,
  )
  return consent !== 'pending' && (consent === null || wasReopened)
}
