import { Cta } from '../ui/Cta'
import { Section } from '../ui/Section'
import { getEstimatorServices, getFormsText } from '@/lib/forms'
import { env } from '@/lib/env'

import { EstimatorWizard } from './EstimatorWizard'

/**
 * The estimator is shown only when at least one service has an active rule. Otherwise the visitor
 * sees the "not available" message and a link to the contact page: no prices are ever made up.
 */
export async function EstimatorSlot() {
  const [text, services] = await Promise.all([getFormsText(), getEstimatorServices()])
  const estimator = text.estimator

  if (!services.length) {
    if (!estimator?.unavailableTitle && !estimator?.unavailableText) return null
    return (
      <Section className="max-w-2xl text-center">
        {estimator?.unavailableTitle && (
          <h2 className="font-heading text-2xl font-semibold text-navy">{estimator.unavailableTitle}</h2>
        )}
        {estimator?.unavailableText && <p className="mt-3 text-body">{estimator.unavailableText}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <Cta label={estimator?.contactUsTitle} url="/contact-us/" />
        </div>
      </Section>
    )
  }

  return (
    <Section>
      <EstimatorWizard
        formText={{ ...text.form }}
        messages={text.messages}
        privacyHref="/privacy-policy/"
        services={services}
        text={{ ...estimator }}
        turnstileSiteKey={env.TURNSTILE_SECRET ? env.TURNSTILE_SITE_KEY : undefined}
      />
    </Section>
  )
}
