import { after } from 'next/server'
import { getPayload } from 'payload'

import config from '@payload-config'

import { runChat, type ChatEvent } from '@/lib/chatbot/chat'
import { MAX_INPUT_CHARS } from '@/lib/chatbot/config'
import { clientIp } from '@/lib/leads/spam'

// POST /api/chat/  { sessionId?, message, pageUrl? }  →  streamed NDJSON, one JSON event per line:
//   {"type":"session","sessionId":"…"} {"type":"token","text":"…"} {"type":"lead","leadId":1}
//   {"type":"refusal","text":"…"} {"type":"fallback","reason":"busy|cap|rate|limit|error|disabled"} {"type":"done"}
// The Groq key stays on the server: the browser only ever talks to this endpoint.
export const maxDuration = 60

const encoder = new TextEncoder()
const line = (event: ChatEvent) => encoder.encode(`${JSON.stringify(event)}\n`)

export async function POST(request: Request) {
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
    return Response.json({ error: 'invalid' }, { status: 415 })
  }
  if (Number(request.headers.get('content-length') ?? 0) > 4000) return Response.json({ error: 'invalid' }, { status: 413 })

  let body: { sessionId?: unknown; message?: unknown; pageUrl?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400 })
  }
  if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > MAX_INPUT_CHARS * 2) {
    return Response.json({ error: 'invalid' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const input = {
    sessionId: typeof body.sessionId === 'string' ? body.sessionId : undefined,
    message: body.message,
    pageUrl: typeof body.pageUrl === 'string' ? body.pageUrl : undefined,
    ip: clientIp(request.headers),
    userAgent: request.headers.get('user-agent') ?? undefined,
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of runChat({ payload, defer: (task) => after(task) }, input)) controller.enqueue(line(event))
      } catch (error) {
        payload.logger.error(`Chat request failed: ${(error as Error).message}`)
        controller.enqueue(line({ type: 'fallback', reason: 'error' }))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no', // keep Nginx from buffering the stream
    },
  })
}
