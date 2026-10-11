'use server'

import { getPayload } from 'payload'

import config from '@payload-config'

import { burstLimited, clientIp } from '../leads/spam'
import { headers } from 'next/headers'
import { confirmSubscription, unsubscribe, type TokenResult } from './subscribe'

// Server actions behind the buttons on /newsletter/confirm/ and /newsletter/unsubscribe/.
// The page only shows a button: the change is made when the person presses it (not on page load), so
// email-security scanners that open links cannot confirm or unsubscribe anyone.

async function guard(): Promise<boolean> {
  return !burstLimited(`news-token:${clientIp(await headers())}`)
}

export async function confirmAction(token: string): Promise<TokenResult> {
  if (!(await guard())) return { ok: false, code: 'invalid' }
  return confirmSubscription(await getPayload({ config }), token)
}

export async function unsubscribeAction(token: string): Promise<TokenResult> {
  if (!(await guard())) return { ok: false, code: 'invalid' }
  return unsubscribe(await getPayload({ config }), token)
}
