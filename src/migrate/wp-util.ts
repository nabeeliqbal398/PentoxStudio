export type Entry = {
  date: string
  title: string
  slug: string
  url: string
  image?: string
  category?: string
  excerpt?: string
  source: string
}

// --- slugs -----------------------------------------------------------------------------------
/** Removes the junk prefixes the old site produced (https-pentoxstudio-com-, url-slug-, blog-, blogs-). */
export function cleanSlug(raw: string): string {
  let slug = raw
  for (let i = 0; i < 4; i++) {
    const next = slug.replace(/^https-pentoxstudio-com-/, '').replace(/^url-slug-/, '').replace(/^blogs?-/, '')
    if (next === slug) break
    slug = next
  }
  return slug.replace(/-+$/g, '') || raw
}

/** Same topic published several times: "top-digital-marketing-agency-pakistan", "...-2", "...-3". */
export const duplicateKey = (slug: string) => cleanSlug(slug).replace(/-\d+$/, '')

// --- categories -----------------------------------------------------------------------------
// Blog categories mirror the services (07 §9). The old site only had "Uncategorized", "Digital Marketing"
// and "Blog", so each post is matched to a service category by topic words in its title/slug. The
// table printed by --dry-run shows every choice, and categories can be changed in the admin afterwards.
const CATEGORY_RULES: [RegExp, string][] = [
  [/local seo|near me|multi-location|google business|map pack/, 'local-seo'],
  [/\bseo\b|search optimi[sz]ation|zero-click|ai search|rank (a )?business website|ranking/, 'seo'],
  [/google ads|ppc|facebook ads|ads cost|lead generation|conversion rate|\bcro\b/, 'digital-marketing'],
  [/whatsapp|social media/, 'social-media-marketing'],
  [/web development|website development|wordpress|outsourc/, 'web-development'],
  [/graphic design|branding|logo/, 'graphic-design'],
  [/video/, 'video-editing'],
]

export function categoryFor(entry: Entry): string {
  const haystack = `${entry.title} ${entry.slug.replace(/-/g, ' ')}`.toLowerCase()
  for (const [pattern, slug] of CATEGORY_RULES) if (pattern.test(haystack)) return slug
  return 'digital-marketing'
}

