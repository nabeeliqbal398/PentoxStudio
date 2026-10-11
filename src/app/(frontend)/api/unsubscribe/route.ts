import { getPayload } from 'payload'

import config from '@payload-config'

import { unsubscribe } from '@/lib/newsletter/subscribe'

// RFC 8058 one-click unsubscribe. Mail clients (Gmail, Apple Mail, ...) POST here, with no page and no confirmation,
// when the reader clicks "Unsubscribe" in their mail app (see the List-Unsubscribe headers on every campaign).
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  const payload = await getPayload({ config })
  const result = await unsubscribe(payload, token)
  return Response.json(result, { status: result.ok ? 200 : 400, headers: { 'Cache-Control': 'no-store' } })
}

// A person opening the link in a browser gets the confirmation page. (Nothing is changed by a GET, so link
// scanners that pre-fetch URLs cannot unsubscribe anyone.)
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? ''
  const target = new URL('/newsletter/unsubscribe/', request.url)
  if (token) target.searchParams.set('token', token)
  return Response.redirect(target, 303)
}
