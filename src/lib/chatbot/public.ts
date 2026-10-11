import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '@payload-config'

import { groqConfigured } from './config'

export type ChatWidgetConfig = {
  greeting: string
  fallbackText: string
  suggestions: string[]
  text: {
    title: string
    launcherLabel: string
    placeholder: string
    send: string
    close: string
    thinking: string
    privacyNote: string
    errorText: string
    whatsappButton: string
    leadSaved: string
    newChat: string
  }
}

/**
 * What the chat widget needs, or null when the chatbot is off: switched off in the admin, or the Groq key / model
 * missing from .env. Only wording is returned: never the key, the prompt or the limits.
 */
export const getChatWidgetConfig = unstable_cache(
  async (): Promise<ChatWidgetConfig | null> => {
    const payload = await getPayload({ config })
    // Read with full access on the server so the model override can be considered; only public wording leaves this function.
    const s = await payload.findGlobal({ slug: 'chatbot-settings', depth: 0, overrideAccess: true })
    if (!s.enabled || !groqConfigured(s.model)) return null
    const w = s.widget ?? {}
    return {
      greeting: s.greeting ?? '',
      fallbackText: s.fallbackText ?? '',
      suggestions: (w.suggestions ?? []).map((item) => item.text),
      text: {
        title: w.title ?? '',
        launcherLabel: w.launcherLabel ?? w.title ?? '',
        placeholder: w.placeholder ?? '',
        send: w.send ?? '',
        close: w.close ?? '',
        thinking: w.thinking ?? '',
        privacyNote: w.privacyNote ?? '',
        errorText: w.errorText ?? '',
        whatsappButton: w.whatsappButton ?? '',
        leadSaved: w.leadSaved ?? '',
        newChat: w.newChat ?? '',
      },
    }
  },
  ['chatbot:widget'],
  { tags: ['global:chatbot-settings'], revalidate: 3600 },
)
