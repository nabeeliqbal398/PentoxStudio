import { getSiteInfo } from '@/lib/site-data'
import { env } from '@/lib/env'
import { entryUrl, getIndexableEntries, type IndexableEntry } from '@/lib/indexable'

// /llms.txt: a plain-markdown map of the site for AI assistants (llmstxt.org). Built from the same list as the
// sitemap, so it only ever mentions public pages, with the descriptions written in the CMS.
export const revalidate = 3600

const clean = (value?: string) => (value ?? '').replace(/\s+/g, ' ').trim()
const line = (entry: IndexableEntry) => `- [${clean(entry.title)}](${entryUrl(entry)})${entry.description ? `: ${clean(entry.description)}` : ''}`

export async function GET() {
  if (env.NOINDEX_SITE === 'true') return new Response('', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })

  const [entries, site] = await Promise.all([getIndexableEntries(), getSiteInfo()])
  const of = (type: IndexableEntry['type']) => entries.filter((entry) => entry.type === type)
  const home = entries.find((entry) => entry.type === 'home')

  const sections: [string, IndexableEntry[]][] = [
    ['Services', of('service')],
    ['Industries', of('industry')],
    ['Portfolio', of('portfolio')],
    ['Blog', of('post').slice(0, 30)],
    ['Company', [...of('hub'), ...of('page')]],
  ]

  const contact = [
    site.addressLines.length ? `Address: ${site.addressLines.join(', ')}` : '',
    site.phone ? `Phone: ${site.phone.display}` : '',
    site.email ? `Email: ${site.email.address}` : '',
    site.whatsapp ? `WhatsApp: +${site.whatsapp.number}` : '',
  ].filter(Boolean)

  const body = [
    `# ${site.businessName}`,
    home?.description ? `\n> ${clean(home.description)}` : '',
    `\nWebsite: ${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/`,
    contact.length ? `\n## Contact\n${contact.map((item) => `- ${item}`).join('\n')}` : '',
    ...sections.filter(([, items]) => items.length).map(([name, items]) => `\n## ${name}\n${items.map(line).join('\n')}`),
    '',
  ]
    .filter((part) => part !== '')
    .join('\n')

  return new Response(`${body}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' },
  })
}
