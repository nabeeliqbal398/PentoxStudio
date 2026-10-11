import type { Payload } from 'payload'
import { z } from 'zod'

import { csvRow } from '../leads/export'

// Subscribers CSV import / export (admin only).
//
// Import rules (nobody is subscribed by accident):
//  - Needs an "email" column; optional "name", "tags" (comma/semicolon separated), "consent" (yes/true/1) and "consent_date".
//  - Duplicates are merged by email (case-insensitive), inside the file and against the database.
//  - A row becomes ACTIVE only if the row says consent = yes AND the person importing ticked the confirmation that these
//    contacts agreed to receive emails. Every other row is imported as PENDING and will not receive campaigns until
//    they confirm.
//  - Unsubscribed and bounced addresses are never reactivated by an import.

/** Minimal RFC 4180 parser: quoted fields, doubled quotes, CRLF/LF, UTF-8 BOM. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((cell) => cell.trim() !== '')) rows.push(row)
      row = []
    } else field += char
  }
  row.push(field)
  if (row.some((cell) => cell.trim() !== '')) rows.push(row)
  return rows
}

export const MAX_IMPORT_ROWS = 20_000

const truthy = (value: string | undefined) => /^(yes|y|true|1|consented|opted[- ]?in)$/i.test((value ?? '').trim())
const emailSchema = z.email().max(200)

export type ImportSummary = {
  rows: number
  created: number
  createdActive: number
  createdPending: number
  updated: number
  duplicatesInFile: number
  skippedUnsubscribed: number
  skippedBounced: number
  invalid: { line: number; value: string }[]
  missingColumn?: string
}

const splitTags = (value: string | undefined) =>
  (value ?? '')
    .split(/[;,|]/)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20)

export async function importSubscribers(
  payload: Payload,
  csv: string,
  options: { attested: boolean; now?: number },
): Promise<ImportSummary> {
  const now = options.now ?? Date.now()
  const summary: ImportSummary = {
    rows: 0,
    created: 0,
    createdActive: 0,
    createdPending: 0,
    updated: 0,
    duplicatesInFile: 0,
    skippedUnsubscribed: 0,
    skippedBounced: 0,
    invalid: [],
  }
  const table = parseCsv(csv)
  if (!table.length) return { ...summary, missingColumn: 'email' }

  const header = table[0].map((cell) => cell.trim().toLowerCase().replace(/[\s-]+/g, '_'))
  const col = (name: string) => header.indexOf(name)
  const emailAt = col('email') >= 0 ? col('email') : col('e_mail')
  if (emailAt < 0) return { ...summary, missingColumn: 'email' }
  const [nameAt, tagsAt, consentAt, consentDateAt] = [col('name'), col('tags'), col('consent'), col('consent_date')]

  const lines = table.slice(1, MAX_IMPORT_ROWS + 1)
  summary.rows = lines.length
  const seen = new Set<string>()

  for (const [index, cells] of lines.entries()) {
    const raw = (cells[emailAt] ?? '').trim().toLowerCase()
    const parsed = emailSchema.safeParse(raw)
    if (!parsed.success) {
      if (summary.invalid.length < 50) summary.invalid.push({ line: index + 2, value: raw.slice(0, 80) })
      continue
    }
    if (seen.has(raw)) {
      summary.duplicatesInFile += 1
      continue
    }
    seen.add(raw)

    const name = nameAt >= 0 ? cells[nameAt]?.trim().slice(0, 120) || undefined : undefined
    const tags = tagsAt >= 0 ? splitTags(cells[tagsAt]) : []
    const consented = options.attested && consentAt >= 0 && truthy(cells[consentAt])
    const consentDate = consentDateAt >= 0 ? new Date(cells[consentDateAt] ?? '') : undefined

    const found = await payload.find({ collection: 'subscribers', where: { email: { equals: raw } }, limit: 1, depth: 0, overrideAccess: true })
    const existing = found.docs[0]

    if (existing) {
      if (existing.status === 'unsubscribed') {
        summary.skippedUnsubscribed += 1
        continue
      }
      if (existing.status === 'bounced') {
        summary.skippedBounced += 1
        continue
      }
      // Existing pending/active address: merge tags and a missing name; never downgrade or re-send anything.
      const merged = [...new Set([...(existing.tags ?? []), ...tags])]
      const changed = merged.length !== (existing.tags ?? []).length || (name && !existing.name)
      if (changed) {
        await payload.update({ collection: 'subscribers', id: existing.id, overrideAccess: true, data: { tags: merged, name: existing.name || name } })
        summary.updated += 1
      }
      continue
    }

    await payload.create({
      collection: 'subscribers',
      overrideAccess: true,
      data: {
        email: raw,
        name,
        tags,
        source: 'import',
        status: consented ? 'active' : 'pending',
        consentAt: consented ? (consentDate && !Number.isNaN(consentDate.getTime()) ? consentDate : new Date(now)).toISOString() : undefined,
        confirmedAt: consented ? new Date(now).toISOString() : undefined,
      },
    })
    summary.created += 1
    if (consented) summary.createdActive += 1
    else summary.createdPending += 1
  }
  return summary
}

export const EXPORT_COLUMNS = ['email', 'name', 'status', 'source', 'tags', 'consent_at', 'confirmed_at', 'unsubscribed_at', 'created_at'] as const

export async function exportSubscribersCsv(payload: Payload, filter?: { status?: string; tag?: string }): Promise<string> {
  const lines = [csvRow([...EXPORT_COLUMNS])]
  let page = 1
  for (;;) {
    const result = await payload.find({
      collection: 'subscribers',
      where: {
        and: [
          ...(filter?.status ? [{ status: { equals: filter.status } }] : []),
          ...(filter?.tag ? [{ tags: { in: [filter.tag] } }] : []),
        ],
      },
      depth: 0,
      limit: 500,
      page,
      sort: 'createdAt',
      overrideAccess: true,
    })
    for (const doc of result.docs) {
      lines.push(csvRow([doc.email, doc.name, doc.status, doc.source, (doc.tags ?? []).join('; '), doc.consentAt, doc.confirmedAt, doc.unsubscribedAt, doc.createdAt]))
    }
    if (!result.hasNextPage) break
    page += 1
  }
  return `﻿${lines.join('\r\n')}\r\n`
}
