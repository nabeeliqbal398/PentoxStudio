import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { contentBlocks } from '../blocks'

// Long-form editor (posts, pages, case studies): H2-H4 only (the page title is the H1),
// plus tables and the Callout / CTA / FAQ / YouTube blocks.
export const contentEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((feature) => feature.key !== 'heading'),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    FixedToolbarFeature(),
    BlocksFeature({ blocks: contentBlocks }),
    // Tables (pricing comparisons etc. in the migrated blog posts).
    EXPERIMENTAL_TableFeature(),
  ],
})
