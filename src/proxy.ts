import { NextResponse, type NextRequest } from 'next/server'

import { findRedirect } from './lib/redirects'

// Enforces the Redirects collection (old WordPress URLs → new URLs, capture/07 §9) with real
// 301s before any page renders. A rule wins over a page at the same path, so the Redirects
// collection should list retired URLs only.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const rule = await findRedirect(pathname)
  if (!rule) return NextResponse.next()

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
