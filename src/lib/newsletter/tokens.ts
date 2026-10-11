import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

import { env } from '../env'

// Signed, stateless tokens for the links in newsletter emails.
//  - confirm:      { id, p: 'c', n: nonce, exp }  expires after 48 hours and is single-use (the nonce is
//                  stored on the subscriber and cleared once used)
//  - unsubscribe:  { id, p: 'u' }                 never expires, so old emails keep working
// The signature is an HMAC-SHA256 with a key derived from PAYLOAD_SECRET; a token cannot be forged or
// altered, and a confirm token cannot be used as an unsubscribe token (the purpose is signed too).

export type TokenPurpose = 'c' | 'u'

export type TokenPayload = { id: number; p: TokenPurpose; n?: string; exp?: number }

export const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000

const key = () => createHmac('sha256', env.PAYLOAD_SECRET).update('newsletter-token-v1').digest()

const b64 = (value: Buffer | string) => Buffer.from(value).toString('base64url')

export function signToken(payload: TokenPayload): string {
  const body = b64(JSON.stringify(payload))
  return `${body}.${b64(createHmac('sha256', key()).update(body).digest())}`
}

export function verifyToken(token: string | null | undefined, purpose: TokenPurpose, now = Date.now()): TokenPayload | null {
  if (!token || token.length > 500) return null
  const [body, signature, extra] = token.split('.')
  if (!body || !signature || extra !== undefined) return null
  const expected = createHmac('sha256', key()).update(body).digest()
  const given = Buffer.from(signature, 'base64url')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload
    if (payload.p !== purpose || !Number.isInteger(payload.id)) return null
    if (payload.exp !== undefined && payload.exp < now) return null
    return payload
  } catch {
    return null
  }
}

export const newNonce = () => randomBytes(16).toString('hex')

export const siteUrl = () => env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')

export const confirmUrl = (token: string) => `${siteUrl()}/newsletter/confirm/?token=${encodeURIComponent(token)}`
export const unsubscribePageUrl = (token: string) => `${siteUrl()}/newsletter/unsubscribe/?token=${encodeURIComponent(token)}`
/** The RFC 8058 one-click endpoint (POST). */
export const unsubscribeApiUrl = (token: string) => `${siteUrl()}/api/unsubscribe/?token=${encodeURIComponent(token)}`
