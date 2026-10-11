import type { Endpoint, PayloadRequest } from 'payload'
import { z } from 'zod'

import { hasRole } from '../../access'
import { createDraftFromPost } from './draft'
import { exportSubscribersCsv, importSubscribers } from './csv'
import { countAudience, sendTest, startCampaign } from './send'

// Admin-only REST endpoints behind the buttons in the admin UI (components/admin/*).

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

const staff = (req: PayloadRequest) => hasRole(req.user, 'admin', 'editor')
const forbidden = () => json({ error: 'Forbidden' }, 403)

const idOf = (req: PayloadRequest) => Number(req.routeParams?.id)

// --- Subscribers -----------------------------------------------------------------------------
export const exportSubscribersEndpoint: Endpoint = {
  path: '/export',
  method: 'get',
  handler: async (req) => {
    if (!staff(req)) return forbidden()
    const csv = await exportSubscribersCsv(req.payload, {
      status: req.searchParams.get('status') || undefined,
      tag: req.searchParams.get('tag') || undefined,
    })
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  },
}

const MAX_FILE_BYTES = 5_000_000

export const importSubscribersEndpoint: Endpoint = {
  path: '/import',
  method: 'post',
  handler: async (req) => {
    if (!staff(req)) return forbidden()
    const form = await req.formData?.().catch(() => null)
    const file = form?.get('file')
    if (!(file instanceof File)) return json({ error: 'Choose a CSV file.' }, 400)
    if (file.size > MAX_FILE_BYTES) return json({ error: 'The file is larger than 5 MB.' }, 400)
    const attested = form?.get('attested') === 'true'
    const summary = await importSubscribers(req.payload, await file.text(), { attested })
    if (summary.missingColumn) return json({ error: `The file needs an "${summary.missingColumn}" column.` }, 400)
    return json({ summary, attested })
  },
}

// --- Campaigns -------------------------------------------------------------------------------
export const campaignAudienceEndpoint: Endpoint = {
  path: '/:id/audience',
  method: 'get',
  handler: async (req) => {
    if (!staff(req)) return forbidden()
    const campaign = await req.payload.findByID({ collection: 'campaigns', id: idOf(req), depth: 0, overrideAccess: true }).catch(() => null)
    if (!campaign) return json({ error: 'Campaign not found.' }, 404)
    return json({ recipients: await countAudience(req.payload, campaign) })
  },
}

export const campaignTestEndpoint: Endpoint = {
  path: '/:id/test',
  method: 'post',
  handler: async (req) => {
    if (!staff(req)) return forbidden()
    const body = z.object({ to: z.email() }).safeParse(await req.json?.().catch(() => ({})))
    if (!body.success) return json({ error: 'Enter a valid email address for the test.' }, 400)
    const result = await sendTest(req.payload, idOf(req), body.data.to)
    return result.ok ? json({ ok: true }) : json({ error: result.error }, 400)
  },
}

export const campaignSendEndpoint: Endpoint = {
  path: '/:id/send',
  method: 'post',
  handler: async (req) => {
    if (!staff(req)) return forbidden()
    const id = idOf(req)
    const started = await startCampaign(req.payload, id)
    if (!started.ok) return json({ error: started.error }, 400)
    await req.payload.jobs.queue({ task: 'send-campaign-batch', input: { campaignId: id }, queue: 'default' })
    return json({ ok: true, recipients: started.recipients })
  },
}

export const campaignStopEndpoint: Endpoint = {
  path: '/:id/stop',
  method: 'post',
  handler: async (req) => {
    if (!staff(req)) return forbidden()
    const campaign = await req.payload.findByID({ collection: 'campaigns', id: idOf(req), depth: 0, overrideAccess: true }).catch(() => null)
    if (!campaign || campaign.status !== 'sending') return json({ error: 'The campaign is not sending.' }, 400)
    // Stopped campaigns keep their position and can be resumed with "Send" (they show as Failed).
    await req.payload.update({
      collection: 'campaigns',
      id: campaign.id,
      overrideAccess: true,
      data: { status: 'failed', progress: { ...campaign.progress, lockedUntil: null, lastError: 'Stopped by an admin. Use Resume to continue.' } },
    })
    return json({ ok: true })
  },
}

// --- Posts -----------------------------------------------------------------------------------
export const postNewsletterDraftEndpoint: Endpoint = {
  path: '/:id/newsletter-draft',
  method: 'post',
  handler: async (req) => {
    if (!staff(req)) return forbidden()
    const result = await createDraftFromPost(req.payload, idOf(req))
    return result.ok ? json(result) : json({ error: result.error }, 400)
  },
}
