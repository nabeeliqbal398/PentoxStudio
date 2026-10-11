import { NextResponse, type NextRequest } from 'next/server'

import { env } from './lib/env'
import { findRedirect } from './lib/redirects'
import { buildCsp, CONSENT_COOKIE } from './lib/security'

/**
 * Per-request headers for public pages: the Content-Security-Policy (analytics origins only after cookie consent,
 * Turnstile only when configured) and, on a staging site, X-Robots-Tag. It also drops two headers Payload adds to
 * every response (Accept-CH / Critical-CH): the latter makes Chromium re-request each page, costing about 0.6 s.
 */
function withSecurityHeaders(request: NextRequest, response: NextResponse) {
  response.headers.set(
    'Content-Security-Policy',
    buildCsp({
      analytics: request.cookies.get(CONSENT_COOKIE)?.value === 'accepted',
      turnstile: Boolean(env.TURNSTILE_SECRET && env.TURNSTILE_SITE_KEY),
      upgradeInsecure: env.NEXT_PUBLIC_SITE_URL.startsWith('https://'),
      dev: process.env.NODE_ENV !== 'production',
    }),
  )
  if (env.NOINDEX_SITE === 'true') response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  response.headers.delete('Critical-CH')
  response.headers.delete('Accept-CH')
  return response
}

// Enforces the Redirects collection (old WordPress URLs → new URLs, capture/07 §9) with real
// 301s before any page renders. A rule wins over a page at the same path, so the Redirects
// collection should list retired URLs only.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const rule = await findRedirect(pathname)
  if (!rule) return withSecurityHeaders(request, NextResponse.next())

  // `to` is a site path or a full https URL; anything else is ignored.
  let target: URL
  if (rule.to.startsWith('/') && !rule.to.startsWith('//')) {
    target = new URL(rule.to, request.url)
  } else {
    try {
      target = new URL(rule.to)
    } catch {
      return NextResponse.next()
    }
    if (target.protocol !== 'https:' && target.protocol !== 'http:') return NextResponse.next()
  }
  if (!target.search) target.search = search // keep tracking parameters such as utm_*

  return NextResponse.redirect(target, rule.status)
}

export const config = {
  // Skip the admin, API, Next internals, the preview entry and static files.
  matcher: ['/((?!admin|api|_next|next/preview|brand|favicon\\.ico|.*\\..*).*)'],
}
