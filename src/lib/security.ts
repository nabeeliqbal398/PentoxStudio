// Security headers. The Content-Security-Policy for public pages is built per request (see src/proxy.ts) because
// analytics origins are allowed ONLY for visitors who accepted cookies: a visitor who declined or never answered
// gets a policy that does not even permit a connection to GA4 / GTM / Clarity. Cloudflare Turnstile is allowed only
// when it is configured.

export const CONSENT_COOKIE = 'pentox_consent'

export type CspOptions = {
  /** The visitor accepted cookies (pentox_consent=accepted). */
  analytics: boolean
  /** Turnstile site key + secret are configured. */
  turnstile: boolean
  /** Production serves https, so insecure sub-requests are upgraded. */
  upgradeInsecure: boolean
  /** Next.js dev mode needs eval for hot reloading. */
  dev: boolean
}

const ANALYTICS = {
  script: ['https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://www.clarity.ms', 'https://scripts.clarity.ms'],
  connect: [
    'https://www.google-analytics.com',
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com',
    'https://*.clarity.ms',
    'https://c.bing.com',
  ],
  img: ['https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://www.googletagmanager.com', 'https://*.clarity.ms', 'https://c.bing.com'],
}

const TURNSTILE = 'https://challenges.cloudflare.com'

// Booking and map embeds allowed on /contact-us/ and /book-a-call/ (same allow-list as lib/embeds.ts), plus the
// privacy-friendly YouTube player used in blog posts.
const FRAMES = [
  'https://www.google.com',
  'https://maps.google.com',
  'https://cal.com',
  'https://app.cal.com',
  'https://calendly.com',
  'https://www.youtube-nocookie.com',
]

export function buildCsp({ analytics, turnstile, upgradeInsecure, dev }: CspOptions): string {
  const list = (...parts: (string | string[] | false)[]) => parts.flatMap((part) => (part ? [part].flat() : [])).join(' ')
  const directives = [
    `default-src 'self'`,
    // 'unsafe-inline': Next.js writes inline bootstrap scripts into pages that are cached and shared between visitors,
    // so a per-request nonce is not possible. Outside origins remain limited to the lists above.
    `script-src ${list("'self'", "'unsafe-inline'", dev && "'unsafe-eval'", analytics && ANALYTICS.script, turnstile && TURNSTILE)}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src ${list("'self'", 'data:', 'blob:', analytics && ANALYTICS.img)}`,
    `font-src 'self' data:`,
    `connect-src ${list("'self'", dev && 'ws:', analytics && ANALYTICS.connect)}`,
    `frame-src ${list(FRAMES, turnstile && TURNSTILE)}`,
    `frame-ancestors 'self'`, // the admin Live Preview shows the site in an iframe on the same origin
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    upgradeInsecure && 'upgrade-insecure-requests',
  ]
  return directives.filter(Boolean).join('; ')
}

/** The admin (Payload) needs inline + eval scripts and loads nothing from third parties. */
export const ADMIN_CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self' data:`,
  `connect-src 'self'`,
  `frame-src 'self'`,
  `frame-ancestors 'self'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join('; ')

/** Headers for every response (set in next.config.ts). HSTS is added only in production, over https. */
export const baseSecurityHeaders = (production: boolean): { key: string; value: string }[] => [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  ...(production ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
]
