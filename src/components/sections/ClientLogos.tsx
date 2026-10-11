import { safeLink } from '@/lib/links'
import { one, toImg } from '@/lib/media'
import type { Client } from '@/payload-types'

import { CmsImage } from '../ui/CmsImage'
import { Section } from '../ui/Section'

/** Client logo strip. Only clients who gave permission are readable; none means hidden. */
export function ClientLogos({ clients, heading }: { clients: Client[]; heading?: string | null }) {
  const logos = clients.flatMap((client) => {
    const img = toImg(one(client.logo), 'card')
    return img ? [{ client, img }] : []
  })
  if (!logos.length) return null
  return (
    <Section className="!py-8" labelledBy={heading ? 'clients-heading' : undefined}>
      {heading && (
        <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-muted" id="clients-heading">
          {heading}
        </h2>
      )}
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {logos.map(({ client, img }) => {
          const link = safeLink(client.website)
          const logo = (
            <CmsImage
              className="h-10 w-auto max-w-[9rem] object-contain opacity-80 grayscale"
              img={{ ...img, alt: client.name }}
            />
          )
          return (
            <li key={client.id}>
              {link?.kind === 'external' ? (
                <a href={link.href} rel="noopener noreferrer" target="_blank">
                  {logo}
                </a>
              ) : (
                logo
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
