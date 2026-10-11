import type { Payload } from 'payload'

import { env } from '../env'
import { isEmailConfigured } from './config'

// The only place that sends mail. Callers get a result instead of an exception, so an SMTP
// problem can never lose a lead. Swap the provider by changing the adapter in payload.config.ts.

export type EmailMessage = {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  /** Extra headers, e.g. List-Unsubscribe for newsletters. */
  headers?: Record<string, string>
}

export type EmailResult = { status: 'sent' } | { status: 'skipped'; reason: string } | { status: 'failed'; reason: string }

const SEND_TIMEOUT_MS = 15_000

export async function sendEmail(payload: Payload, message: EmailMessage): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    return { status: 'skipped', reason: 'SMTP is not configured (set SMTP_HOST and EMAIL_FROM in .env)' }
  }
  try {
    await Promise.race([
      payload.sendEmail({
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
        headers: message.headers,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP timed out')), SEND_TIMEOUT_MS)),
    ])
    return { status: 'sent' }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    payload.logger.error(`Email to ${message.to} failed: ${reason}`)
    return { status: 'failed', reason: reason.slice(0, 200) }
  }
}

export const leadNotifyAddress = (): string | undefined => env.LEAD_NOTIFY_TO
