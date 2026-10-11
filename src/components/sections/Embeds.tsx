import { bookingEmbedUrl, mapEmbedSrc } from '@/lib/embeds'
import { safeLink } from '@/lib/links'

import { Cta } from '../ui/Cta'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'

/**
 * Cal.com / Calendly booking embed from Site settings (or BOOKING_URL). Hidden when no booking URL
 * is set. A URL from another provider is not framed; only the "open booking page" link is shown.
 */
export function BookingEmbed({
  url,
  heading,
  intro,
  openLabel,
  id,
}: {
  url?: string
  heading?: string | null
  intro?: string | null
  openLabel?: string | null
  id: string
}) {
  if (!url) return null
  const embed = bookingEmbedUrl(url)
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} intro={intro} />
      </div>
      {embed && (
        <iframe
          className="h-[720px] w-full rounded-2xl border border-line/40 bg-white"
          loading="lazy"
          src={embed}
          title={heading ?? 'Booking calendar'}
        />
      )}
      <div className="mt-6 text-center">
        <Cta label={openLabel} newTab url={safeLink(url)?.href} variant="outline" />
      </div>
    </Section>
  )
}

/** Google Map from Site settings. Hidden when the map URL is not set or is not a Google Maps embed. */
export function MapEmbed({ url, heading, id }: { url?: string; heading?: string | null; id: string }) {
  const src = mapEmbedSrc(url)
  if (!src) return null
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} />
      </div>
      <iframe
        className="h-[420px] w-full rounded-2xl border border-line/40"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
        title={heading ?? 'Map'}
      />
    </Section>
  )
}
