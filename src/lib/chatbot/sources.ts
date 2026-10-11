import type { Payload, Where } from 'payload'

import { populated } from '../media'
import { richTextToPlain, type KnowledgeSource } from './chunk'

// What the chatbot may know. Everything is read with the PUBLIC access rules (overrideAccess: false, no user), so
// drafts, inactive packages and admin-only collections can never end up in the knowledge base.

export type SourceFilter = { collection: 'services' | 'faqs' | 'packages' | 'industries' | 'posts' | 'site-settings'; id?: string | number }

const POST_TEXT_LIMIT = 12_000

// Empty parts ("", 0, false, null) are left out, so `list?.length && ...` works as a condition.
const join = (parts: (string | number | null | undefined | false)[]) => parts.filter(Boolean).join('\n')

export async function collectSources(payload: Payload, only?: SourceFilter): Promise<KnowledgeSource[]> {
  const wants = (collection: SourceFilter['collection']) => !only || only.collection === collection
  const byId = (): Where | undefined => (only?.id === undefined ? undefined : { id: { equals: only.id } })
  const out: KnowledgeSource[] = []
  const common = { depth: 1, pagination: false as const, overrideAccess: false as const }

  if (wants('services')) {
    const { docs } = await payload.find({ collection: 'services', where: byId(), ...common })
    for (const s of docs) {
      const parent = typeof s.parent === 'object' ? s.parent : undefined
      out.push({
        sourceType: 'service',
        sourceCollection: 'services',
        sourceId: String(s.id),
        title: `Service: ${s.title}`,
        url: s.path ?? `/services/${s.slug}/`,
        text: join([
          parent && `This is part of the ${parent.title} service.`,
          s.shortDescription,
          s.hero?.intro,
          s.deliverables?.length && `What's included:\n${s.deliverables.map((d) => `- ${d.title}${d.description ? `: ${d.description}` : ''}`).join('\n')}`,
          s.approach?.heading && `${s.approach.heading}. ${s.approach.intro ?? ''}`,
          ...(s.approach?.steps ?? []).map((step, i) => `Step ${i + 1}: ${step.title}. ${step.description}`),
          s.whyChoose?.items?.length && `${s.whyChoose?.heading ?? 'Why choose Pentox Studio'}:\n${s.whyChoose?.items?.map((i) => `- ${i.title}${i.description ? `: ${i.description}` : ''}`).join('\n')}`,
          s.tools?.length && `Tools and technologies: ${s.tools.map((t) => t.name).join(', ')}`,
          s.cta?.text,
          richTextToPlain(s.longform),
        ]),
      })
    }
  }

  if (wants('faqs')) {
    const { docs } = await payload.find({ collection: 'faqs', where: byId(), ...common })
    for (const f of docs) {
      const service = populated(f.services)[0]
      out.push({
        sourceType: 'faq',
        sourceCollection: 'faqs',
        sourceId: String(f.id),
        title: `FAQ: ${f.question}`,
        url: service?.path ?? undefined,
        text: `Question: ${f.question}\nAnswer: ${f.answer}`,
      })
    }
  }

  if (wants('packages')) {
    // Public access only returns ACTIVE packages. A price is quoted only when one has been entered.
    const { docs } = await payload.find({ collection: 'packages', where: byId(), ...common })
    for (const p of docs) {
      const service = typeof p.service === 'object' ? p.service : undefined
      const priced = typeof p.startingFrom === 'number'
      out.push({
        sourceType: 'package',
        sourceCollection: 'packages',
        sourceId: String(p.id),
        title: `Package: ${p.title}`,
        url: '/pricing/',
        text: join([
          `${p.title} is the ${p.tier} package${service ? ` for ${service.title}` : ''}.`,
          priced
            ? `Starting from ${[p.currency, p.startingFrom!.toLocaleString('en-US')].filter(Boolean).join(' ')}${p.priceNote ? ` ${p.priceNote}` : ''}.`
            : 'No public price is set for this package: ask the team for a quote.',
          p.features?.length && `Includes:\n${p.features.map((x) => `- ${x.text}`).join('\n')}`,
        ]),
      })
    }
  }

  if (wants('industries')) {
    const { docs } = await payload.find({ collection: 'industries', where: byId(), ...common })
    for (const i of docs) {
      out.push({
        sourceType: 'industry',
        sourceCollection: 'industries',
        sourceId: String(i.id),
        title: `Industry: ${i.title}`,
        url: `/industries/${i.slug}/`,
        text: join([
          i.summary,
          i.hero?.intro,
          i.challenges?.length && `Challenges:\n${i.challenges.map((c) => `- ${c.title}${c.description ? `: ${c.description}` : ''}`).join('\n')}`,
          populated(i.recommendedServices).length && `Recommended services: ${populated(i.recommendedServices).map((s) => s.title).join(', ')}`,
        ]),
      })
    }
  }

  if (wants('posts')) {
    const { docs } = await payload.find({ collection: 'posts', where: byId(), ...common, depth: 0 })
    for (const p of docs) {
      out.push({
        sourceType: 'post',
        sourceCollection: 'posts',
        sourceId: String(p.id),
        title: `Article: ${p.title}`,
        url: `/blog/${p.slug}/`,
        text: join([p.excerpt, richTextToPlain(p.content).slice(0, POST_TEXT_LIMIT)]),
      })
    }
  }

  if (wants('site-settings')) {
    // Business details only. Analytics IDs, map and booking embeds and anything else in the global are left out.
    const s = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: false })
    const a = s.address
    out.push({
      sourceType: 'site-settings',
      sourceCollection: 'site-settings',
      sourceId: 'site-settings',
      title: `Contact details for ${s.businessName}`,
      url: '/contact-us/',
      text: join([
        `${s.businessName} is a digital marketing, design and development agency.`,
        [a?.street, a?.city, a?.region, a?.postalCode, a?.country].some(Boolean) &&
          `Address: ${[a?.street, a?.city, a?.region, a?.postalCode, a?.country].filter(Boolean).join(', ')}.`,
        s.phone && `Phone: ${s.phone}.`,
        s.whatsappNumber && `WhatsApp: +${s.whatsappNumber}.`,
        s.email && `Email: ${s.email}.`,
        s.hours?.length && `Office hours: ${s.hours.map((h) => `${h.days} ${h.opens}-${h.closes}`).join('; ')}.`,
        s.responseTime && s.responseTime,
        'You can request a free audit at /free-audit/ or book a call at /book-a-call/.',
      ]),
    })
  }

  return out.filter((source) => source.text.trim().length > 0)
}
