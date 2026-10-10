import { MessageCircle } from 'lucide-react'

import type { SiteInfo } from '@/lib/site-data'

/** Floating WhatsApp button (bottom-left). Hidden on mobile, where the sticky bar has the same action. */
export function WhatsAppButton({ whatsapp }: { whatsapp: SiteInfo['whatsapp'] }) {
  if (!whatsapp) return null
  return (
    <a
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 left-6 z-30 hidden size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:scale-105 md:flex"
      href={whatsapp.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <MessageCircle aria-hidden="true" className="size-7" />
    </a>
  )
}
