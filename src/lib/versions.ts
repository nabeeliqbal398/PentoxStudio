import type { CollectionConfig } from 'payload'

// Drafts + autosave + scheduled publishing (needs the jobs queue, see payload.config.ts).
export const draftVersions: CollectionConfig['versions'] = {
  drafts: {
    autosave: { interval: 1500 },
    schedulePublish: true,
  },
  maxPerDoc: 25,
}

// Simple draft/publish without autosave or scheduling.
export const simpleDrafts: CollectionConfig['versions'] = {
  drafts: true,
  maxPerDoc: 10,
}
