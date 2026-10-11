import { createHash } from 'node:crypto'

import type { Payload } from 'payload'

import { env } from '../env'

// Spam protection for the public lead forms:
//  1. honeypot field + minimum fill time (checked in process.ts),
//  2. rate limits: a short in-memory burst limit per IP, plus a database limit that counts the leads
//     already saved for the same IP hash (survives restarts and works across several instances),
//  3. Cloudflare Turnstile, only when TURNSTILE_SECRET is set.

export const hashIp = (ip: string) => createHash('sha256').update(`${ip}|${env.PAYLOAD_SECRET}`).digest('hex')

// --- in-memory burst limit (counts every attempt, including rejected ones) ---------------------
const BURST_WINDOW_MS = 60_000
const BURST_MAX = 8
const attempts = new Map<string, number[]>()

export function burstLimited(key: string, now = Date.now()): boolean {
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < BURST_WINDOW_MS)
  recent.push(now)
  attempts.set(key, recent)
  if (attempts.size > 5000) {
    for (const [k, times] of attempts) if (!times.some((t) => now - t < BURST_WINDOW_MS)) attempts.delete(k)
  }
  return recent.length > BURST_MAX
}

// --- database limit ---------------------------------------------------------------------------
export const HOURLY_LIMIT = 5
export const DAILY_LIMIT = 15

export async function dbRateLimited(payload: Payload, ipHash: string, now = Date.now()): Promise<boolean> {
  const since = (ms: number) => new Date(now - ms).toISOString()
  const count = (ms: number) =>
    payload.count({
      collection: 'leads',
      where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: since(ms) } }] },
      overrideAccess: true,
    })
  const [hour, day] = await Promise.all([count(60 * 60 * 1000), count(24 * 60 * 60 * 1000)])
  return hour.totalDocs >= HOURLY_LIMIT || day.totalDocs >= DAILY_LIMIT
}

// --- Turnstile --------------------------------------------------------------------------------
export const turnstileEnabled = () => Boolean(env.TURNSTILE_SECRET)

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true
  if (!token) return false
  try {
    const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token })
    if (ip && ip !== 'unknown') body.set('remoteip', ip)
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    })
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch {
    return false // fail closed: if the check cannot run, the form is not accepted
  }
}

/** Client IP behind a proxy (Nginx sets x-forwarded-for / x-real-ip). */
export function clientIp(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || headers.get('x-real-ip')?.trim() || 'unknown'
}
