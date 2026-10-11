import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '@payload-config'

import type { LeadForm } from '../payload-types'
import { getServiceGroups } from './content'

// Data for the lead forms and the cost estimator. Published services only; the estimator list
// carries option labels but never prices (prices stay server-side, see src/lib/estimator.ts).

const REVALIDATE_SECONDS = 3600

export const getFormsText = unstable_cache(
  async (): Promise<LeadForm> => {
    const payload = await getPayload({ config })
    return payload.findGlobal({ slug: 'lead-forms', depth: 0, overrideAccess: false })
  },
  ['forms:text'],
  { tags: ['global:lead-forms'], revalidate: REVALIDATE_SECONDS },
)

export type FormService = { id: number; title: string; isChild: boolean }

/** Every published service (parents followed by their sub-services) for the "what do you need" step. */
export async function getFormServices(): Promise<FormService[]> {
  const groups = await getServiceGroups()
  return groups.flatMap(({ services }) =>
    services.flatMap((service) => [
      { id: service.id, title: service.title, isChild: false },
      ...service.children.map((child) => ({ id: child.id, title: child.title, isChild: true })),
    ]),
  )
}

export type EstimatorService = {
  id: number
  title: string
  scope: { label: string; description?: string }[]
  timelines: string[]
}

/** Services whose estimator rule is switched on. Empty until the client confirms prices and activates rules. */
export const getEstimatorServices = unstable_cache(
  async (): Promise<EstimatorService[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'estimator-rules',
      where: { active: { equals: true } },
      depth: 1,
      pagination: false,
      overrideAccess: true, // admin-only collection, read on the server
    })
    return docs.flatMap((rule) => {
      const service = typeof rule.service === 'object' ? rule.service : undefined
      if (!service || service._status !== 'published') return []
      return [
        {
          id: service.id,
          title: service.title,
          scope: (rule.scopeOptions ?? []).map((option) => ({
            label: option.label,
            description: option.description || undefined,
          })),
          timelines: (rule.timelineOptions ?? []).map((option) => option.label),
        },
      ]
    })
  },
  ['forms:estimator-services'],
  { tags: ['estimator-rules', 'services'], revalidate: REVALIDATE_SECONDS },
)
