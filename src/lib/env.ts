import { z } from 'zod'

// Treat blank values (e.g. `SMTP_HOST=` copied from .env.example) as "not set".
const blankToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(blankToUndefined, schema.optional())

const PLACEHOLDER_SECRET = 'YOUR_SECRET_HERE'

/**
 * Server-side environment schema. Required variables fail startup with a clear message;
 * variables for later phases (AI, email, analytics, spam protection) are optional for now
 * and become required in the phase that uses them.
 */
const schema = z.object({
  // Core
  DATABASE_URL: z
    .string({ error: 'is required' })
    .regex(/^postgres(ql)?:\/\//, 'must start with postgres:// or postgresql://'),
  PAYLOAD_SECRET: z
    .string({ error: 'is required' })
    .min(16, 'must be at least 16 characters')
    .refine((value) => value !== PLACEHOLDER_SECRET, 'is still the placeholder value'),

  // Public site config
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    blankToUndefined,
    z.url('must be a full URL, e.g. http://localhost:3000').default('http://localhost:3000'),
  ),
  NEXT_PUBLIC_GA_ID: optional(z.string()),
  NEXT_PUBLIC_GTM_ID: optional(z.string()),
  NEXT_PUBLIC_CLARITY_ID: optional(z.string()),
  BOOKING_URL: optional(z.url('must be a full URL')),
  WHATSAPP_NUMBER: optional(z.string().regex(/^\d{8,15}$/, 'must be digits only, e.g. 923001234567')),

  // AI chatbot (Phase 9)
  GROQ_API_KEY: optional(z.string()),
  GROQ_MODEL: optional(z.string()),
  GROQ_BASE_URL: optional(z.url('must be a full URL')),
  EMBEDDING_MODEL: optional(z.string()),

  // Email (Phase 5)
  SMTP_HOST: optional(z.string()),
  SMTP_PORT: optional(z.coerce.number().int().positive()),
  SMTP_USER: optional(z.string()),
  SMTP_PASS: optional(z.string()),
  EMAIL_FROM: optional(z.email('must be an email address')),
  EMAIL_FROM_NAME: optional(z.string()),
  LEAD_NOTIFY_TO: optional(z.email('must be an email address')),

  // Staging switch (Phase 10): "true" makes the whole site noindex (robots, X-Robots-Tag header, empty sitemap).
  NOINDEX_SITE: optional(z.enum(['true', 'false'])),

  // Newsletter sending limits (Phase 8). Defaults suit a personal Gmail account; raise them for
  // Google Workspace or a Hostinger mailbox (check your provider's hourly/daily limits).
  NEWSLETTER_BATCH_SIZE: optional(z.coerce.number().int().min(1).max(500)),
  NEWSLETTER_BATCH_DELAY_SECONDS: optional(z.coerce.number().int().min(0).max(3600)),
  NEWSLETTER_MESSAGE_DELAY_MS: optional(z.coerce.number().int().min(0).max(60000)),
  NEWSLETTER_DAILY_LIMIT: optional(z.coerce.number().int().min(1).max(100000)),

  // Spam protection (Phase 5)
  TURNSTILE_SITE_KEY: optional(z.string()),
  TURNSTILE_SECRET: optional(z.string()),
})

export type Env = z.infer<typeof schema>

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = schema.safeParse(source)
  if (result.success) return result.data

  // Report variable names and reasons only, never the values (they may be secrets).
  const lines = result.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
  throw new Error(
    `Invalid environment configuration:\n${lines.join('\n')}\n` +
      'Fix your .env file (see .env.example for every variable) and restart.',
  )
}

export const env = parseEnv(process.env)
