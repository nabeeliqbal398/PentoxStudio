import { MessageCircle, Phone } from 'lucide-react'

import type { HeaderInfo, SiteInfo, StickyAction } from '@/lib/site-data'

import { SmartLink } from './SmartLink'

const itemClass =
  'flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium text-navy focus-visible:bg-surface-alt'

/** Mobile-only bottom bar: Call · WhatsApp · Quote. Each button appears only if its data exists. */
export function MobileStickyBar({
  actions,
  site,
  header,
}: {
  actions: StickyAction[]
  site: SiteInfo
  header: HeaderInfo
}) {
  if (!actions.length) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex divide-x divide-line/40 border-t border-line/40 bg-white md:hidden">
      {actions.includes('call') && site.phone && (
        <a className={itemClass} href={site.phone.href}>
          <Phone aria-hidden="true" className="size-4" /> Call
        </a>
      )}
      {actions.includes('whatsapp') && site.whatsapp && (
        <a className={itemClass} href={site.whatsapp.href} rel="noopener noreferrer" target="_blank">
          <MessageCircle aria-hidden="true" className="size-4" /> WhatsApp
        </a>
      )}
      {actions.includes('quote') && header.cta && (
        <SmartLink className={`${itemClass} bg-brand !text-white`} link={header.cta.link}>
          {header.cta.label}
        </SmartLink>
      )}
    </div>
  )
}
