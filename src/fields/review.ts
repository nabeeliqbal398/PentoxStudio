import type { Field } from 'payload'

export const REVIEW_NOTE = 'TODO: client review'

// Flags drafted/placeholder content (new services, prices, industries) so nothing unreviewed goes live unnoticed.
export const reviewFields: Field[] = [
  {
    name: 'needsReview',
    type: 'checkbox',
    defaultValue: false,
    index: true,
    admin: {
      position: 'sidebar',
      description: 'Drafted or placeholder content that the client still has to approve.',
    },
  },
  {
    name: 'reviewNote',
    type: 'text',
    admin: {
      position: 'sidebar',
      condition: (_, siblingData) => Boolean(siblingData?.needsReview),
    },
  },
]
