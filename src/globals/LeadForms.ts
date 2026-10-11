import type { Field, GlobalConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

const text = (name: string, label: string, textarea = false): Field =>
  ({ name, type: textarea ? 'textarea' : 'text', label }) as Field

const optionList = (name: string, description: string): Field => ({
  name,
  type: 'array',
  admin: { description },
  fields: [{ name: 'label', type: 'text', required: true }],
})

// All wording and choice lists for the lead forms (multi-step form, free audit, cost estimator).
// Empty option lists hide that question: budget bands are left empty until the client confirms them.
export const LeadForms: GlobalConfig = {
  slug: 'lead-forms',
  label: 'Forms & estimator text',
  admin: {
    group: adminGroups.leads,
    description: 'Wording and answer choices for the contact form, free-audit form and cost estimator.',
  },
  access: { read: () => true, update: isAdminOrEditor },
  hooks: { afterChange: [revalidateGlobal('lead-forms')] },
  fields: [
    {
      name: 'form',
      type: 'group',
      label: 'Multi-step form',
      fields: [
        text('serviceStep', 'Step 1 title (service)'),
        text('serviceHelp', 'Step 1 help text'),
        text('detailsStep', 'Step 2 title (budget & timeline)'),
        text('contactStep', 'Step 3 title (contact details)'),
        text('budgetLabel', 'Budget question'),
        text('timelineLabel', 'Timeline question'),
        text('messageLabel', 'Message label'),
        text('nameLabel', 'Name label'),
        text('emailLabel', 'Email label'),
        text('whatsappLabel', 'WhatsApp / phone label'),
        text('contactHint', 'Hint: email or WhatsApp is needed'),
        text('privacyText', 'Consent text (before the privacy link)'),
        text('privacyLinkLabel', 'Privacy link label'),
        text('next', 'Button: Next'),
        text('back', 'Button: Back'),
        text('submit', 'Button: Send'),
        text('sending', 'Button while sending'),
        text('stepOf', 'Step counter, e.g. "Step {current} of {total}"'),
        text('chooseService', 'Message: choose a service'),
      ],
    },
    {
      name: 'messages',
      type: 'group',
      label: 'Error messages',
      fields: [
        text('invalid', 'Some details are missing or invalid'),
        text('needContact', 'Email or WhatsApp is needed'),
        text('rateLimited', 'Too many requests'),
        text('verification', 'Spam check failed'),
        text('failed', 'Something went wrong'),
      ],
    },
    {
      name: 'audit',
      type: 'group',
      label: 'Free-audit form',
      fields: [
        text('websiteLabel', 'Website URL label'),
        text('goalLabel', 'Main goal label'),
        text('submit', 'Button'),
      ],
    },
    {
      name: 'estimator',
      type: 'group',
      label: 'Cost estimator',
      fields: [
        text('serviceTitle', 'Step: service'),
        text('scopeTitle', 'Step: scope'),
        text('scopeHelp', 'Scope help text'),
        text('timelineTitle', 'Step: timeline'),
        text('resultTitle', 'Step: estimate'),
        text('rangeLabel', 'Label above the price range'),
        text('fromLabel', 'Label when only one figure is shown'),
        text('contactUsTitle', 'Heading when no price is set'),
        text('contactUsText', 'Text when no price is set', true),
        text('unlockTitle', 'Heading: unlock detailed quote'),
        text('unlockText', 'Text: unlock detailed quote', true),
        text('unlockButton', 'Button: unlock'),
        text('requestButton', 'Button: request a quote (no price set)'),
        text('breakdownTitle', 'Heading: detailed quote'),
        text('baseLabel', 'Line: starting price'),
        text('timelineLine', 'Line: timeline'),
        text('totalLabel', 'Line: estimated total'),
        text('disclaimer', 'Disclaimer', true),
        text('thanks', 'Message after the quote is shown', true),
        text('restart', 'Button: start again'),
        text('unavailableTitle', 'Heading when the estimator is not available'),
        text('unavailableText', 'Text when the estimator is not available', true),
      ],
    },
    {
      name: 'options',
      type: 'group',
      label: 'Answer choices',
      fields: [
        optionList('budget', 'Budget choices. Leave empty to hide the budget question (do not guess prices).'),
        optionList('timeline', 'Timeline choices.'),
      ],
    },
  ],
}
