import { getFormsText } from '@/lib/forms'
import { env } from '@/lib/env'

import { AuditForm } from './AuditForm'

export async function AuditFormSlot() {
  const text = await getFormsText()
  if (!text.audit?.submit) return null
  return (
    <AuditForm
      messages={text.messages}
      privacyHref="/privacy-policy/"
      text={{ ...text.form, ...text.audit }}
      turnstileSiteKey={env.TURNSTILE_SECRET ? env.TURNSTILE_SITE_KEY : undefined}
    />
  )
}
