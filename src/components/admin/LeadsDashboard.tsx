import Link from 'next/link'
import type { AdminViewServerProps, Where } from 'payload'

import { hasRole } from '../../access'
import { leadSources } from '../../collections/Leads'

const statuses = [
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['proposal', 'Proposal'],
  ['won', 'Won'],
  ['lost', 'Lost'],
] as const

// Dashboard panel: leads this month by source and by status. Only admins/editors can read Leads,
// so the panel renders nothing for other roles.
export const LeadsDashboard = async ({ payload, user }: Pick<AdminViewServerProps, 'payload' | 'user'>) => {
  if (!hasRole(user, 'admin', 'editor')) return null

  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
  const inMonth = { createdAt: { greater_than_equal: monthStart } }
  const count = async (where: Where) =>
    (await payload.count({ collection: 'leads', where, user, overrideAccess: false })).totalDocs

  const [total, ...rest] = await Promise.all([
    count(inMonth),
    ...leadSources.map((source) => count({ and: [inMonth, { source: { equals: source.value } }] })),
    ...statuses.map(([value]) => count({ and: [inMonth, { status: { equals: value } }] })),
    count({ status: { equals: 'new' } }),
  ])
  const bySource = rest.slice(0, leadSources.length)
  const byStatus = rest.slice(leadSources.length, leadSources.length + statuses.length)
  const openNew = rest[rest.length - 1]
  const max = Math.max(1, ...bySource)
  const monthName = now.toLocaleString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ marginBottom: 4 }}>Leads – {monthName}</h2>
      <p style={{ marginTop: 0 }}>
        <strong>{total}</strong> this month · <strong>{openNew}</strong> still marked New ·{' '}
        <Link href="/admin/collections/leads">Open leads</Link>
      </p>
      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div>
          <h4>By source</h4>
          {leadSources.map((source, index) => (
            <div key={source.value} style={{ margin: '6px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>{source.label}</span>
                <strong>{bySource[index]}</strong>
              </div>
              <div style={{ background: 'var(--theme-elevation-100)', height: 6, borderRadius: 3 }}>
                <div style={{ background: '#dd2c33', height: 6, borderRadius: 3, width: `${(bySource[index] / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <h4>By status</h4>
          {statuses.map(([value, label], index) => (
            <div key={value} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, margin: '6px 0' }}>
              <span>{label}</span>
              <strong>{byStatus[index]}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
