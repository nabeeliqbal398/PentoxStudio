import { getFormServices, getFormsText } from '@/lib/forms'
import { env } from '@/lib/env'

import { LeadForm } from './LeadForm'

const PRIVACY_HREF = '/privacy-policy/'

/** Server wrapper: loads the services and wording from the CMS and renders the multi-step form. */
export async function LeadFormSlot({
  source,
  serviceId,
}: {
  source: 'contact-form' | 'prefooter-form'
  /** Pre-selects this service (service pages). */
  serviceId?: number
}) {
  const [text, services] = await Promise.all([getFormsText(), getFormServices()])
  if (!text.form?.submit) return null // the form needs its wording; nothing is shown until it is seeded
  return (
    <LeadForm
      budgets={(text.options?.budget ?? []).map((option) => option.label)}
      messages={text.messages}
      preselected={serviceId}
      privacyHref={PRIVACY_HREF}
      services={services}
      source={source}
      text={text.form}
      timelines={(text.options?.timeline ?? []).map((option) => option.label)}
      turnstileSiteKey={env.TURNSTILE_SECRET ? env.TURNSTILE_SITE_KEY : undefined}
    />
  )
}
