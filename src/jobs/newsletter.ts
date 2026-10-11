import type { TaskConfig } from 'payload'

import { runBatch, startCampaign } from '../lib/newsletter/send'

// Newsletter sending runs on Payload's job queue (jobs.autoRun in payload.config.ts checks it every minute).
//
// send-campaign-batch : sends ONE batch for a campaign, then queues the next batch after the configured pause
//                       (NEWSLETTER_BATCH_DELAY_SECONDS). The sending ledger makes it resumable and duplicate-free.
// campaign-scheduler  : every minute, starts campaigns whose status is "Scheduled" and whose time has come.

export const sendCampaignBatch: TaskConfig<'send-campaign-batch'> = {
  slug: 'send-campaign-batch',
  label: 'Send newsletter batch',
  inputSchema: [{ name: 'campaignId', type: 'number', required: true }],
  outputSchema: [
    { name: 'sent', type: 'number' },
    { name: 'failed', type: 'number' },
    { name: 'done', type: 'checkbox' },
  ],
  // A failed attempt (database hiccup) is retried a few times before the job is abandoned.
  retries: 3,
  handler: async ({ input, req }) => {
    const result = await runBatch(req.payload, input.campaignId)
    if (!result.done && result.nextRunAt) {
      await req.payload.jobs.queue({
        task: 'send-campaign-batch',
        input: { campaignId: input.campaignId },
        queue: 'default',
        waitUntil: result.nextRunAt,
      })
    }
    return { output: { sent: result.sent, failed: result.failed, done: result.done } }
  },
}

export const campaignScheduler: TaskConfig<'campaign-scheduler'> = {
  slug: 'campaign-scheduler',
  label: 'Start scheduled campaigns',
  schedule: [{ cron: '0 * * * * *', queue: 'default' }],
  inputSchema: [],
  outputSchema: [{ name: 'started', type: 'number' }],
  handler: async ({ req }) => {
    const due = await req.payload.find({
      collection: 'campaigns',
      where: { and: [{ status: { equals: 'scheduled' } }, { scheduledAt: { less_than_equal: new Date().toISOString() } }] },
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })
    let started = 0
    for (const campaign of due.docs) {
      const result = await startCampaign(req.payload, campaign.id)
      if (result.ok) {
        await req.payload.jobs.queue({ task: 'send-campaign-batch', input: { campaignId: campaign.id }, queue: 'default' })
        started += 1
      } else {
        await req.payload.update({
          collection: 'campaigns',
          id: campaign.id,
          overrideAccess: true,
          data: { status: 'failed', progress: { ...campaign.progress, lastError: result.error.slice(0, 250) } },
        })
      }
    }
    return { output: { started } }
  },
}

export const newsletterTasks = [sendCampaignBatch, campaignScheduler] as TaskConfig[]
