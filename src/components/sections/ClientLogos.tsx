import { safeLink } from '@/lib/links'
import { one, toImg, type Img } from '@/lib/media'
import type { Client } from '@/payload-types'

import { CmsImage } from '../ui/CmsImage'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'

type Logo = { client: Client; img: Img }

function Grid({ logos }: { logos: Logo[] }) {
  return (
    <ul className="grid grid-cols-3 items-center gap-x-6 gap-y-8 md:grid-cols-6">
      {logos.map(({ client, img }) => {
        const link = safeLink(client.website)
        const logo = (
          <CmsImage
            className="mx-auto max-h-[60px] w-auto max-w-full object-contain opacity-80 grayscale transition duration-300 hover:scale-105 hover:opacity-100 hover:grayscale-0"
            img={{ ...img, alt: client.name }}
          />
        )
        return (
          <li className="flex h-20 items-center justify-center" key={client.id}>
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
  )
}

/**
 * Client logo grid. Only clients who gave permission are readable. When clients are tagged
 * international / domestic and the group labels are set, the two groups are shown separately.
 * Hidden when there are no logos.
 */
export function ClientLogos({
  clients,
  heading,
  intro,
  internationalLabel,
  domesticLabel,
}: {
  clients: Client[]
  heading?: string | null
  intro?: string | null
  internationalLabel?: string | null
  domesticLabel?: string | null
}) {
  const logos: Logo[] = clients.flatMap((client) => {
    const img = toImg(one(client.logo), 'card')
    return img ? [{ client, img }] : []
  })
  if (!logos.length) return null

  const international = logos.filter(({ client }) => client.group === 'international')
  const domestic = logos.filter(({ client }) => client.group === 'domestic')
  const grouped = Boolean((internationalLabel || domesticLabel) && (international.length || domestic.length))
  const ungrouped = logos.filter(({ client }) => !client.group)

  const label = (text?: string | null) =>
    text && (
      <h3 className="mb-6 inline-block border-b-2 border-brand pb-1 font-heading text-sm font-semibold uppercase tracking-widest text-navy">
        {text}
      </h3>
    )

  return (
    <Section className={heading ? '' : '!py-8'} labelledBy={heading ? 'clients-heading' : undefined}>
      <div id="clients-heading">
        <SectionHeading heading={heading} intro={intro} />
      </div>
      {grouped ? (
        <div className="space-y-10">
          {international.length > 0 && (
            <div>
              {label(internationalLabel)}
              <Grid logos={international} />
            </div>
          )}
          {domestic.length > 0 && (
            <div>
              {label(domesticLabel)}
              <Grid logos={domestic} />
            </div>
          )}
          {ungrouped.length > 0 && <Grid logos={ungrouped} />}
        </div>
      ) : (
        <Grid logos={logos} />
      )}
    </Section>
  )
}
