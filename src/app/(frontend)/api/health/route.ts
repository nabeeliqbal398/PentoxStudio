import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

import config from '@payload-config'

// GET /api/health/: for uptime monitoring (UptimeRobot) and the Docker health check. Reports only "ok" / "down";
// nothing about the configuration.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.db.drizzle.execute(sql`SELECT 1`)
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ status: 'down' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
