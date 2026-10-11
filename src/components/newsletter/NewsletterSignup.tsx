import { env } from '@/lib/env'
import { getNewsletterText } from '@/lib/newsletter/settings'

import { NewsletterForm, type NewsletterFormProps } from './NewsletterForm'

/**
 * Server wrapper: wording comes from the "Newsletter text" settings (the footer can override heading and text).
 * Renders nothing when the wording has not been set up, so an unseeded site shows no half-empty form.
 */
export async function NewsletterSignup({
  source,
  tone = 'light',
  heading,
  text,
}: {
  source: NewsletterFormProps['source']
  tone?: 'dark' | 'light'
  heading?: string
  text?: string
}) {
  const settings = await getNewsletterText()
  const signup = settings.signup
  if (!signup?.button || !signup.success) return null
  const dark = tone === 'dark'
  const title = heading || signup.heading
  const intro = text || signup.text

  return (
    <div>
      {title && <p className={`font-heading text-lg font-semibold ${dark ? 'text-white' : 'text-navy'}`}>{title}</p>}
      {intro && <p className={`mb-4 mt-1 text-sm ${dark ? 'text-white/75' : 'text-body'}`}>{intro}</p>}
      <NewsletterForm
        privacyHref="/privacy-policy/"
        source={source}
        text={signup}
        tone={tone}
        turnstileSiteKey={env.TURNSTILE_SECRET ? env.TURNSTILE_SITE_KEY : undefined}
      />
    </div>
  )
}
