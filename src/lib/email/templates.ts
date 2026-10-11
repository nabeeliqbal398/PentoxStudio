// Plain, inline-styled HTML + text bodies for the two lead emails. Every value that comes from a
// visitor is HTML-escaped. No promises are made beyond the response time set in Site settings.

const escape = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export type LeadEmailData = {
  name: string
  email?: string
  whatsapp?: string
  sourceLabel: string
  services: string[]
  budget?: string
  timeline?: string
  message?: string
  website?: string
  estimateLines?: { label: string; value: string }[]
  adminUrl: string
  businessName: string
  responseTime?: string
}

const shell = (body: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#333;max-width:560px">${body}</div>`

const rows = (items: [string, string | undefined][]) =>
  items
    .filter(([, value]) => value)
    .map(([label, value]) => `<tr><td style="padding:4px 12px 4px 0;color:#71747B;vertical-align:top">${escape(label)}</td><td style="padding:4px 0">${escape(value)}</td></tr>`)
    .join('')

export function autoReplyEmail(data: LeadEmailData) {
  const subject = `We received your request – ${data.businessName}`
  const lines = (data.estimateLines ?? []).filter((line) => line.value)
  const html = shell(
    `<p>Hi ${escape(data.name)},</p>
     <p>Thank you for contacting ${escape(data.businessName)}. We have received your ${escape(data.sourceLabel.toLowerCase())} and will be in touch.</p>
     ${data.responseTime ? `<p>${escape(data.responseTime)}</p>` : ''}
     ${lines.length ? `<p><strong>Your estimate</strong></p><table>${rows(lines.map((l) => [l.label, l.value]))}</table>` : ''}
     <p>– The ${escape(data.businessName)} team</p>`,
  )
  const text = [
    `Hi ${data.name},`,
    '',
    `Thank you for contacting ${data.businessName}. We have received your ${data.sourceLabel.toLowerCase()} and will be in touch.`,
    data.responseTime ?? '',
    ...(lines.length ? ['', 'Your estimate', ...lines.map((l) => `${l.label}: ${l.value}`)] : []),
    '',
    `– The ${data.businessName} team`,
  ]
    .filter((line, index, all) => line !== '' || all[index - 1] !== '')
    .join('\n')
  return { subject, html, text }
}

export function alertEmail(data: LeadEmailData) {
  const subject = `New lead (${data.sourceLabel}): ${data.name}`
  const details: [string, string | undefined][] = [
    ['Name', data.name],
    ['Email', data.email],
    ['WhatsApp / phone', data.whatsapp],
    ['Source', data.sourceLabel],
    ['Services', data.services.join(', ') || undefined],
    ['Budget', data.budget],
    ['Timeline', data.timeline],
    ['Website', data.website],
    ['Message', data.message],
    ...((data.estimateLines ?? []).map((l) => [l.label, l.value]) as [string, string][]),
  ]
  const html = shell(
    `<p><strong>New lead received</strong></p><table>${rows(details)}</table><p><a href="${escape(data.adminUrl)}">Open in the admin</a></p>`,
  )
  const text = [
    'New lead received',
    ...details.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    '',
    `Open in the admin: ${data.adminUrl}`,
  ].join('\n')
  return { subject, html, text }
}
