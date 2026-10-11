import { z } from 'zod'

// Server-side validation for every public lead form. Limits keep junk and abuse out of the CMS.

const text = (max: number) => z.string().trim().max(max)
const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), text(max).optional())

export const leadSources = ['contact-form', 'prefooter-form', 'free-audit', 'estimator'] as const
export type PublicLeadSource = (typeof leadSources)[number]

/** First-touch tracking sent by the browser from the pentox_ft cookie. Untrusted: strings only, truncated. */
export const attributionSchema = z
  .object({
    utmSource: optionalText(200),
    utmMedium: optionalText(200),
    utmCampaign: optionalText(200),
    utmTerm: optionalText(200),
    utmContent: optionalText(200),
    referrer: optionalText(500),
    landingPage: optionalText(500),
  })
  .partial()

export type Attribution = z.infer<typeof attributionSchema>

/** Accepts "example.com" or a full URL; only http(s) survives. */
export function normaliseWebsite(value: string): string | undefined {
  const raw = value.trim()
  if (!raw) return undefined
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined
    if (!url.hostname.includes('.')) return undefined
    return url.toString().slice(0, 300)
  } catch {
    return undefined
  }
}

const phone = optionalText(40).refine((v) => !v || /^[+\d][\d\s().-]{5,}$/.test(v), 'invalid phone')

export const contactSchema = z.object({
  name: text(120).min(1),
  email: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.email().max(200).optional()),
  whatsapp: phone,
  privacy: z.literal(true),
})

export const leadFormSchema = contactSchema.extend({
  serviceIds: z.array(z.number().int().positive()).max(20).default([]),
  budget: optionalText(100),
  timeline: optionalText(100),
  message: optionalText(2000),
})

export const auditFormSchema = contactSchema.extend({
  website: z.string().trim().max(300).transform((v) => normaliseWebsite(v)).pipe(z.string()),
  message: optionalText(2000),
})

export const estimatorLeadSchema = contactSchema.extend({
  serviceId: z.number().int().positive(),
  scope: z.array(text(200)).max(50).default([]),
  timeline: optionalText(100),
})

/** At least one way to reach the visitor. */
export const hasContactMethod = (data: { email?: string; whatsapp?: string }) => Boolean(data.email || data.whatsapp)
