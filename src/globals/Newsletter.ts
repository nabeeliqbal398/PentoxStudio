import type { Field, GlobalConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

const text = (name: string, label: string, textarea = false): Field =>
  ({ name, type: textarea ? 'textarea' : 'text', label }) as Field

// Wording for the signup form, the confirm / unsubscribe pages and the system emails.
// Every newsletter email also carries the business address from Site settings and an unsubscribe link.
export const Newsletter: GlobalConfig = {
  slug: 'newsletter',
  label: 'Newsletter text',
  admin: {
    group: adminGroups.leads,
    description: 'Signup form, confirm/unsubscribe pages and confirmation email wording.',
  },
  access: { read: () => true, update: isAdminOrEditor },
  hooks: { afterChange: [revalidateGlobal('newsletter')] },
  fields: [
    {
      name: 'signup',
      type: 'group',
      label: 'Signup form',
      fields: [
        text('heading', 'Heading'),
        text('text', 'Text', true),
        text('emailLabel', 'Email label'),
        text('emailPlaceholder', 'Email placeholder'),
        text('button', 'Button'),
        text('sending', 'Button while sending'),
        text('consentText', 'Consent text (before the privacy link)'),
        text('privacyLinkLabel', 'Privacy link label'),
        text('success', 'Message after signing up (check your inbox)', true),
        text('errorInvalid', 'Error: invalid email or consent missing'),
        text('errorRate', 'Error: too many attempts'),
        text('errorVerification', 'Error: spam check failed'),
        text('errorFailed', 'Error: could not send the confirmation email'),
      ],
    },
    {
      name: 'confirmPage',
      type: 'group',
      label: 'Confirm page',
      fields: [
        text('title', 'Title'),
        text('intro', 'Text', true),
        text('button', 'Button'),
        text('doneTitle', 'Title after confirming'),
        text('doneText', 'Text after confirming', true),
        text('invalidTitle', 'Title for an invalid or expired link'),
        text('invalidText', 'Text for an invalid or expired link', true),
        text('homeLink', 'Link back to the site'),
      ],
    },
    {
      name: 'unsubscribePage',
      type: 'group',
      label: 'Unsubscribe page',
      fields: [
        text('title', 'Title'),
        text('intro', 'Text', true),
        text('button', 'Button'),
        text('doneTitle', 'Title after unsubscribing'),
        text('doneText', 'Text after unsubscribing', true),
        text('invalidTitle', 'Title for an invalid link'),
        text('invalidText', 'Text for an invalid link', true),
        text('homeLink', 'Link back to the site'),
      ],
    },
    {
      name: 'emails',
      type: 'group',
      label: 'Emails',
      fields: [
        text('confirmSubject', 'Confirmation email: subject'),
        text('confirmIntro', 'Confirmation email: text', true),
        text('confirmButton', 'Confirmation email: button'),
        text('confirmIgnore', 'Confirmation email: "if this was not you" line', true),
        text('reason', 'Footer: why the person receives it', true),
        text('unsubscribeLink', 'Footer: unsubscribe link text'),
        text('viewOnSite', 'Footer: view on the website'),
      ],
    },
  ],
}
