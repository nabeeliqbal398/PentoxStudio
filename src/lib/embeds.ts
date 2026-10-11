// Embeds are rendered in iframes, so only known providers are accepted for the iframe `src`.
// Anything else from the CMS is shown as a plain link instead.

const hostOf = (value: string): string | undefined => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.hostname : undefined
  } catch {
    return undefined
  }
}

const BOOKING_HOSTS = new Set(['cal.com', 'app.cal.com', 'calendly.com'])

/** Cal.com / Calendly link that may be embedded in an iframe. */
export function bookingEmbedUrl(value: string | undefined): string | undefined {
  if (!value) return undefined
  const host = hostOf(value)
  if (!host || !BOOKING_HOSTS.has(host)) return undefined
  const url = new URL(value)
  if (host === 'calendly.com') {
    url.searchParams.set('hide_gdpr_banner', '1')
  } else {
    url.searchParams.set('embed', 'true')
  }
  return url.toString()
}

/** Google Maps embed (iframe) URL. */
export function mapEmbedSrc(value: string | undefined): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    const ok =
      url.protocol === 'https:' &&
      (url.hostname === 'www.google.com' || url.hostname === 'maps.google.com' || url.hostname === 'google.com') &&
      url.pathname.startsWith('/maps')
    return ok ? url.toString() : undefined
  } catch {
    return undefined
  }
}

const YOUTUBE_ID = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/

/** Privacy-enhanced embed URL for a YouTube link, or undefined if it is not a YouTube video. */
export function youtubeEmbedUrl(value: string | null | undefined): string | undefined {
  const id = value ? YOUTUBE_ID.exec(value)?.[1] : undefined
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined
}
