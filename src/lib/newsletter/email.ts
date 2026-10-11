import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTML, type HTMLConvertersFunction } from '@payloadcms/richtext-lexical/html'
import type { Payload } from 'payload'

import type { Campaign, Media, Newsletter } from '../../payload-types'
import { collectionPaths } from '../paths'
import { mediaSrc } from '../media'
import { signToken, siteUrl, unsubscribeApiUrl, unsubscribePageUrl, confirmUrl, CONFIRM_TTL_MS } from './tokens'

// Builds the HTML + plain-text bodies of the two kinds of newsletter email. Every message carries the
// business address (from Site settings) and a personal unsubscribe link; campaigns also carry the
// RFC 8058 one-click headers. All visitor- or editor-supplied text is escaped.

export const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const safeUrl = (value: string | undefined | null): string => {
  if (!value) return '#'
  try {
    const url = new URL(value, `${siteUrl()}/`)
    return url.protocol === 'https:' || url.protocol === 'http:' || url.protocol === 'mailto:' ? url.toString() : '#'
  } catch {
    return '#'
  }
}

export type Sender = { name: string; address: string }

/** Business name + one-line postal address from Site settings. The address is required to send campaigns. */
export async function getSender(payload: Payload): Promise<Sender> {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
  const a = settings.address
  const address = [a?.street, [a?.city, a?.region].filter(Boolean).join(', '), a?.postalCode, a?.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')
  return { name: settings.businessName || 'Pentox Studio', address }
}

const BASE = 'font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#4a4a4a'

function shell(preheader: string | undefined, inner: string, footer: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f5f5;${BASE}">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px">
<tr><td style="padding:28px 32px">${inner}</td></tr>
<tr><td style="padding:16px 32px 28px;border-top:1px solid #e5e5e5;font-size:12px;line-height:1.5;color:#71747b">${footer}</td></tr>
</table></td></tr></table></body></html>`
}

const footerHtml = (sender: Sender, reason: string | undefined, unsubscribe?: { url: string; label: string }) =>
  [
    reason ? `<p style="margin:0 0 8px">${escapeHtml(reason)}</p>` : '',
    unsubscribe ? `<p style="margin:0 0 8px"><a href="${escapeHtml(unsubscribe.url)}" style="color:#467ff7">${escapeHtml(unsubscribe.label)}</a></p>` : '',
    `<p style="margin:0">${escapeHtml(sender.name)}${sender.address ? `, ${escapeHtml(sender.address)}` : ''}</p>`,
  ].join('')

const footerText = (sender: Sender, reason: string | undefined, unsubscribe?: { url: string; label: string }) =>
  [reason, unsubscribe ? `${unsubscribe.label}: ${unsubscribe.url}` : '', `${sender.name}${sender.address ? `, ${sender.address}` : ''}`]
    .filter(Boolean)
    .join('\n')

// --- confirmation email -----------------------------------------------------------------------
export function confirmationEmail(args: {
  subscriberId: number
  nonce: string
  sender: Sender
  text: Newsletter['emails']
}) {
  const token = signToken({ id: args.subscriberId, p: 'c', n: args.nonce, exp: Date.now() + CONFIRM_TTL_MS })
  const link = confirmUrl(token)
  const t = args.text ?? {}
  const subject = t.confirmSubject || 'Confirm your subscription'
  const intro = t.confirmIntro || ''
  const button = t.confirmButton || 'Confirm subscription'
  const ignore = t.confirmIgnore || ''
  const html = shell(
    undefined,
    `<h1 style="margin:0 0 16px;font-size:22px;color:#1c244b">${escapeHtml(subject)}</h1>
     ${intro ? `<p style="margin:0 0 20px">${escapeHtml(intro)}</p>` : ''}
     <p style="margin:0 0 20px"><a href="${escapeHtml(link)}" style="display:inline-block;background:#dd2c33;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:24px;font-weight:bold">${escapeHtml(button)}</a></p>
     <p style="margin:0 0 8px;font-size:13px;word-break:break-all"><a href="${escapeHtml(link)}" style="color:#467ff7">${escapeHtml(link)}</a></p>
     ${ignore ? `<p style="margin:16px 0 0;font-size:13px">${escapeHtml(ignore)}</p>` : ''}`,
    footerHtml(args.sender, undefined),
  )
  const text = [subject, '', intro, '', `${button}: ${link}`, '', ignore, '', footerText(args.sender, undefined)].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n')
  return { subject, html, text, token }
}

// --- campaign body (Lexical → email HTML) ------------------------------------------------------
type LexNode = { type?: string; value?: unknown; children?: LexNode[]; [key: string]: unknown }

/** Replaces upload ids with the media documents, so images can be written as absolute <img> URLs. */
async function withMedia(payload: Payload, data: DefaultTypedEditorState): Promise<DefaultTypedEditorState> {
  const ids = new Set<number>()
  const visit = (node: LexNode) => {
    if (node.type === 'upload' && typeof node.value === 'number') ids.add(node.value)
    node.children?.forEach(visit)
  }
  visit(data.root as unknown as LexNode)
  if (!ids.size) return data
  const { docs } = await payload.find({ collection: 'media', where: { id: { in: [...ids] } }, depth: 0, pagination: false, overrideAccess: true })
  const byId = new Map(docs.map((doc) => [doc.id, doc]))
  const clone = structuredClone(data)
  const fill = (node: LexNode) => {
    if (node.type === 'upload' && typeof node.value === 'number') node.value = byId.get(node.value) ?? node.value
    node.children?.forEach(fill)
  }
  fill(clone.root as unknown as LexNode)
  return clone
}

const converters: HTMLConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }: { node: { value: unknown } }) => {
    const media = node.value as Media | number
    if (typeof media !== 'object' || !media?.url) return ''
    const src = mediaSrc(media.sizes?.hero?.url ?? media.url)
    return `<img src="${escapeHtml(safeUrl(src))}" alt="${escapeHtml(media.alt ?? '')}" width="536" style="max-width:100%;height:auto;border-radius:6px" />`
  },
  link: ({ node, nodesToHTML }) => {
    const fields = (node as { fields?: { url?: string; linkType?: string; doc?: { relationTo?: string; value?: unknown } } }).fields
    let href = fields?.url
    if (fields?.linkType === 'internal') {
      const value = fields.doc?.value
      const doc = typeof value === 'object' ? (value as { slug?: string; path?: string }) : undefined
      href = (fields.doc?.relationTo && collectionPaths[fields.doc.relationTo]?.(doc)) || '/'
    }
    return `<a href="${escapeHtml(safeUrl(href))}" style="color:#467ff7">${nodesToHTML({ nodes: (node as LexNode).children as never, parent: node as never }).join('')}</a>`
  },
  blocks: {
    callout: ({ node }: { node: unknown }) => {
      const f = (node as { fields: { title?: string; body?: string } }).fields
      return `<div style="border-left:4px solid #467ff7;background:#f2f6ff;padding:12px 16px;margin:16px 0">${f.title ? `<strong>${escapeHtml(f.title)}</strong><br/>` : ''}${escapeHtml(f.body ?? '')}</div>`
    },
    cta: ({ node }: { node: unknown }) => {
      const f = (node as { fields: { heading?: string; text?: string; buttonLabel?: string; buttonUrl?: string } }).fields
      return `<div style="background:#1c244b;color:#ffffff;padding:20px;border-radius:8px;text-align:center;margin:20px 0"><p style="margin:0 0 8px;font-size:18px;font-weight:bold">${escapeHtml(f.heading ?? '')}</p>${f.text ? `<p style="margin:0 0 12px">${escapeHtml(f.text)}</p>` : ''}<a href="${escapeHtml(safeUrl(f.buttonUrl))}" style="display:inline-block;background:#dd2c33;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:20px;font-weight:bold">${escapeHtml(f.buttonLabel ?? '')}</a></div>`
    },
    faq: ({ node }: { node: unknown }) => {
      const f = (node as { fields: { heading?: string; items?: { question: string; answer: string }[] } }).fields
      return `${f.heading ? `<h2>${escapeHtml(f.heading)}</h2>` : ''}${(f.items ?? []).map((i) => `<p><strong>${escapeHtml(i.question)}</strong><br/>${escapeHtml(i.answer)}</p>`).join('')}`
    },
    youtube: ({ node }: { node: unknown }) => {
      const f = (node as { fields: { url?: string; title?: string } }).fields
      return `<p><a href="${escapeHtml(safeUrl(f.url))}" style="color:#467ff7">${escapeHtml(f.title || f.url || '')}</a></p>`
    },
  },
})

const STYLES: [RegExp, string][] = [
  [/<h2>/g, '<h2 style="margin:24px 0 8px;font-size:20px;color:#1c244b">'],
  [/<h3>/g, '<h3 style="margin:20px 0 8px;font-size:18px;color:#1c244b">'],
  [/<h4>/g, '<h4 style="margin:16px 0 8px;font-size:16px;color:#1c244b">'],
  [/<p>/g, '<p style="margin:0 0 16px">'],
  [/<ul>/g, '<ul style="margin:0 0 16px;padding-left:24px">'],
  [/<ol>/g, '<ol style="margin:0 0 16px;padding-left:24px">'],
  [/<blockquote>/g, '<blockquote style="margin:16px 0;padding-left:16px;border-left:3px solid #dd2c33">'],
]

export type RenderedBody = { html: string; text: string }

/** The editor content of a campaign as email-safe HTML + a plain-text twin. */
export async function renderCampaignBody(payload: Payload, content: Campaign['content']): Promise<RenderedBody> {
  const data = await withMedia(payload, content as DefaultTypedEditorState)
  let html = convertLexicalToHTML({ data, converters, disableContainer: true })
  for (const [pattern, replacement] of STYLES) html = html.replace(pattern, replacement)
  return { html, text: htmlToText(html) }
}

export function htmlToText(html: string): string {
  return html
    .replace(/<a [^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gis, (_m, href: string, label: string) => {
      const plain = label.replace(/<[^>]+>/g, '')
      return href && href !== '#' && plain.trim() !== href ? `${plain} (${href.replace(/&amp;/g, '&')})` : plain
    })
    .replace(/<img [^>]*alt="([^"]*)"[^>]*>/gi, (_m, alt: string) => (alt ? `[${alt}]` : ''))
    .replace(/<\/(p|h[1-6]|li|div|blockquote|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** One recipient's copy of a campaign: personal unsubscribe link, business address, one-click headers. */
export function campaignMessage(args: {
  subject: string
  preheader?: string | null
  body: RenderedBody
  subscriberId: number
  sender: Sender
  text: Newsletter['emails']
  /** Test sends show a link that does not work (no real subscriber) and carry no List-Unsubscribe header. */
  test?: boolean
}) {
  const token = signToken({ id: args.subscriberId, p: 'u' })
  const t = args.text ?? {}
  const unsubscribe = {
    url: args.test ? `${siteUrl()}/newsletter/unsubscribe/` : unsubscribePageUrl(token),
    label: t.unsubscribeLink || 'Unsubscribe',
  }
  const reason = t.reason || undefined
  const html = shell(
    args.preheader ?? undefined,
    `<h1 style="margin:0 0 16px;font-size:24px;color:#1c244b">${escapeHtml(args.subject)}</h1>${args.body.html}`,
    footerHtml(args.sender, reason, unsubscribe),
  )
  const text = `${args.subject}\n\n${args.body.text}\n\n--\n${footerText(args.sender, reason, unsubscribe)}`
  const headers = args.test
    ? undefined
    : {
        'List-Unsubscribe': `<${unsubscribeApiUrl(token)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      }
  return { html, text, headers }
}
