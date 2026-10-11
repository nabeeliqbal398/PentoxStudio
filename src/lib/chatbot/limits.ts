import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { hashIp } from '../leads/spam'

// Rate limits and the daily usage cap, stored in the database so they hold across restarts and several instances.

const day = (now: number) => new Date(now).toISOString().slice(0, 10)
const hour = (now: number) => new Date(now).toISOString().slice(0, 13)

/** Atomically adds 1 to a bucket and returns the new count. */
export async function hit(payload: Payload, bucket: string): Promise<number> {
  const result = await payload.db.drizzle.execute(sql`
    INSERT INTO chatbot_usage (bucket, count) VALUES (${bucket}, 1)
    ON CONFLICT (bucket) DO UPDATE SET count = chatbot_usage.count + 1, updated_at = now()
    RETURNING count
  `)
  return Number((result.rows[0] as { count: number | string }).count)
}

export async function read(payload: Payload, bucket: string): Promise<number> {
  const result = await payload.db.drizzle.execute(sql`SELECT count FROM chatbot_usage WHERE bucket = ${bucket}`)
  return Number((result.rows[0] as { count?: number | string } | undefined)?.count ?? 0)
}

/** Counts one message from this visitor in the current hour. True when they are over `perHour`. */
export async function overIpLimit(payload: Payload, ip: string, perHour: number, now = Date.now()): Promise<boolean> {
  return (await hit(payload, `ip:${hashIp(ip)}:${hour(now)}`)) > perHour
}

/** True when today's chatbot replies have reached the cap (0 = no cap). */
export async function overDailyCap(payload: Payload, cap: number, now = Date.now()): Promise<boolean> {
  if (cap <= 0) return false
  return (await read(payload, `day:${day(now)}`)) >= cap
}

export const countReply = (payload: Payload, now = Date.now()) => hit(payload, `day:${day(now)}`)

/** Deletes counters older than 3 days (called occasionally). */
export async function purgeOld(payload: Payload) {
  await payload.db.drizzle.execute(sql`DELETE FROM chatbot_usage WHERE updated_at < now() - interval '3 days'`)
}
