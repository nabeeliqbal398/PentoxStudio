import type { Endpoint, Where } from 'payload'

import { hasRole } from '../../access'

// CSV export of leads for admins/editors: GET /api/leads/export/?status=&source=&from=&to=
// (from/to are YYYY-MM-DD, inclusive). Notes are admin-only data, so they are included for admins only.

const COLUMNS = [
  'id',
  'createdAt',
  'status',
  'source',
  'name',
  'email',
  'whatsapp',
  'phone',
  'company',
  'services',
  'budget',
  'timeline',
  'website',
  'message',
  'estimate_service',
  'estimate_min',
  'estimate_max',
  'estimate_currency',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'referrer',
  'landing_page',
  'submitted_path',
  'auto_reply',
  'alert',
  'notes',
] as const

/** Quotes a CSV cell and defuses spreadsheet formulas (=, +, -, @, tab, CR at the start). */
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export const csvRow = (cells: unknown[]) => cells.map(csvCell).join(',')

type LeadDoc = Record<string, unknown> & {
  services?: ({ title?: string } | number)[] | null
  estimate?: { service?: { title?: string } | number | null; rangeMin?: number; rangeMax?: number; currency?: string } | null
  attribution?: Record<string, string | undefined> | null
  emailLog?: { autoReply?: string; alert?: string } | null
}

export function leadToRow(lead: LeadDoc, includeNotes: boolean): unknown[] {
  const title = (value: unknown) => (typeof value === 'object' && value ? (value as { title?: string }).title : value)
  return [
    lead.id,
    lead.createdAt,
    lead.status,
    lead.source,
    lead.name,
    lead.email,
    lead.whatsapp,
    lead.phone,
    lead.company,
    (lead.services ?? []).map(title).join('; '),
    lead.budget,
    lead.timeline,
    lead.website,
    lead.message,
    title(lead.estimate?.service),
    lead.estimate?.rangeMin,
    lead.estimate?.rangeMax,
    lead.estimate?.currency,
    lead.attribution?.utmSource,
    lead.attribution?.utmMedium,
    lead.attribution?.utmCampaign,
    lead.attribution?.utmTerm,
    lead.attribution?.utmContent,
    lead.attribution?.referrer,
    lead.attribution?.landingPage,
    lead.submittedPath,
    lead.emailLog?.autoReply,
    lead.emailLog?.alert,
    includeNotes ? lead.notes : '',
  ]
}

export const exportLeadsEndpoint: Endpoint = {
  path: '/export',
  method: 'get',
  handler: async (req) => {
    if (!hasRole(req.user, 'admin', 'editor')) {
      return new Response('Forbidden', { status: 403 })
    }
    const params = req.searchParams
    const and: Where[] = []
    const status = params.get('status')
    const source = params.get('source')
    const from = params.get('from')
    const to = params.get('to')
    if (status) and.push({ status: { equals: status } })
    if (source) and.push({ source: { equals: source } })
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) and.push({ createdAt: { greater_than_equal: `${from}T00:00:00.000Z` } })
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) and.push({ createdAt: { less_than_equal: `${to}T23:59:59.999Z` } })

    const includeNotes = hasRole(req.user, 'admin')
    const lines = [csvRow([...COLUMNS])]
    let page = 1
    for (;;) {
      const result = await req.payload.find({
        collection: 'leads',
        where: and.length ? { and } : undefined,
        depth: 1,
        limit: 500,
        page,
        sort: '-createdAt',
        user: req.user,
        overrideAccess: false,
      })
      for (const doc of result.docs) lines.push(csvRow(leadToRow(doc as unknown as LeadDoc, includeNotes)))
      if (!result.hasNextPage) break
      page += 1
    }

    const stamp = new Date().toISOString().slice(0, 10)
    return new Response(`﻿${lines.join('\r\n')}\r\n`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-${stamp}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  },
}
