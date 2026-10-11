import { getPayload } from 'payload'

import config from '@payload-config'

import { clientIp } from '@/lib/leads/spam'
import { subscribe } from '@/lib/newsletter/subscribe'

// POST /api/subscribe/  { email, source, consent: true, hp, t, "cf-turnstile-response" }
// Double opt-in: this only creates a PENDING subscriber and sends the confirmation email.
export async function POST(request: Request) {
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
    return Response.json({ ok: false, code: 'invalid' }, { status: 415 })
  }
  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > 5000) return Response.json({ ok: false, code: 'invalid' }, { status: 413 })

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json({ ok: false, code: 'invalid' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const startedAt = Number(body.t)
  const result = await subscribe(
    payload,
    { email: body.email, source: body.source ?? 'footer', consent: body.consent === true },
    {
      ip: clientIp(request.headers),
      userAgent: request.headers.get('user-agent') ?? undefined,
      honeypot: typeof body.hp === 'string' && body.hp.trim() ? body.hp : undefined,
      startedAt: Number.isFinite(startedAt) && startedAt > 0 ? startedAt : undefined,
      turnstileToken: typeof body['cf-turnstile-response'] === 'string' ? (body['cf-turnstile-response'] as string) : undefined,
    },
  )
  const status = result.ok ? 200 : result.code === 'rate' ? 429 : result.code === 'failed' ? 502 : 400
  return Response.json(result, { status, headers: { 'Cache-Control': 'no-store' } })
}
