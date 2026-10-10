'use client'

import Link from 'next/link'

import { reopenConsent, setConsent, useConsentBannerOpen } from './consent'

export function CookieConsent() {
  const open = useConsentBannerOpen()
  if (!open) return null

  return (
    <div
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-3xl rounded-xl border border-line/40 bg-white p-4 shadow-[0_20px_70px_rgba(28,36,75,.25)] md:bottom-6 md:p-5"
      role="region"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <p className="flex-1 text-sm leading-relaxed text-body">
          We use analytics cookies to understand how the site is used. They are only set if you accept.{' '}
          <Link className="text-accent underline underline-offset-2" href="/cookie-policy/">
            Cookie policy
          </Link>
        </p>
        <div className="flex gap-3">
          <button
            className="rounded-full border-[1.5px] border-navy px-5 py-2 text-sm font-medium text-navy hover:bg-surface-alt"
            onClick={() => setConsent('rejected')}
            type="button"
          >
            Decline
          </button>
          <button
            className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-active"
            onClick={() => setConsent('accepted')}
            type="button"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

/** Footer link that lets visitors change their choice later. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button className={className} onClick={reopenConsent} type="button">
      Cookie settings
    </button>
  )
}
