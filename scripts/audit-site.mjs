// Crawl audit of a running site: node scripts/audit-site.mjs [baseUrl]   (default http://localhost:3000)
//   pnpm audit:site            (or: pnpm audit:site https://new.pentoxstudio.com)
// Reads /sitemap.xml and checks every listed page: status 200, one <h1>, a <title> and meta description of sensible
// length, a self-referencing canonical URL, no noindex, images with alt text, landmarks, and the security headers.
// Then checks that URLs which must NOT be indexed really say so. Exit code 1 if anything fails.
import { URL } from 'node:url'

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')
let failures = 0
const fail = (message) => {
  failures += 1
  console.log(`  FAIL ${message}`)
}

const get = async (path, init) => {
  const response = await fetch(new URL(path, base), { redirect: 'manual', ...init })
  return { response, body: await response.text() }
}
const tag = (html, pattern) => pattern.exec(html)?.[1]?.trim()

console.log(`Auditing ${base}\n`)

const { response: sitemapResponse, body: sitemap } = await get('/sitemap.xml')
if (sitemapResponse.status !== 200) fail(`/sitemap.xml returned ${sitemapResponse.status}`)
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
console.log(`sitemap.xml lists ${urls.length} URLs`)

const required = ['content-security-policy', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'x-frame-options']
for (const listed of urls) {
  const path = new URL(listed).pathname + new URL(listed).search
  const { response, body } = await get(path)
  const problems = []
  const warnings = [] // worth fixing in the CMS, but not a failure
  if (response.status !== 200) problems.push(`status ${response.status}`)
  const titleText = tag(body, /<title>([^<]*)<\/title>/i)
  if (!titleText) problems.push('no <title>')
  else if (titleText.length > 70) warnings.push(`title is ${titleText.length} characters (may be cut off)`)
  const description = tag(body, /<meta name="description" content="([^"]*)"/i)
  if (!description) problems.push('no meta description')
  else if (description.length < 50 || description.length > 170) warnings.push(`description is ${description.length} characters`)
  const h1s = (body.match(/<h1[\s>]/g) ?? []).length
  if (h1s !== 1) problems.push(`${h1s} <h1> elements`)
  const canonical = tag(body, /<link rel="canonical" href="([^"]*)"/i)
  if (!canonical) problems.push('no canonical')
  else if (new URL(canonical).pathname !== new URL(listed).pathname) problems.push(`canonical points to ${canonical}`)
  if (/<meta name="robots" content="[^"]*noindex/i.test(body)) problems.push('is noindex but listed in the sitemap')
  if (!/<html[^>]*\slang="/i.test(body)) problems.push('no lang attribute')
  if (!/<main[\s>]/i.test(body)) problems.push('no <main> landmark')
  const imagesWithoutAlt = (body.match(/<img(?![^>]*\salt=)[^>]*>/gi) ?? []).length
  if (imagesWithoutAlt) problems.push(`${imagesWithoutAlt} image(s) without an alt attribute`)
  for (const header of required) if (!response.headers.get(header)) problems.push(`missing ${header} header`)
  const note = [...problems, ...warnings.map((w) => `warning: ${w}`)].join('; ')
  console.log(`${problems.length ? 'FAIL' : warnings.length ? 'warn' : ' ok '} ${path}${note ? `  <- ${note}` : ''}`)
  if (problems.length) failures += 1
}

console.log('\nMust NOT be indexable or reachable:')
const mustBeNoindex = ['/thank-you/', '/newsletter/confirm/?token=x', '/newsletter/unsubscribe/?token=x', '/blog/?q=seo', '/blog/?category=seo']
for (const path of mustBeNoindex) {
  const { response, body } = await get(path)
  const header = response.headers.get('x-robots-tag') ?? ''
  const noindex = /noindex/i.test(header) || /<meta name="robots" content="[^"]*noindex/i.test(body)
  const inSitemap = urls.some((u) => new URL(u).pathname + new URL(u).search === path)
  console.log(`${noindex && !inSitemap ? ' ok ' : 'FAIL'} ${path} (status ${response.status}, noindex: ${noindex}, in sitemap: ${inSitemap})`)
  if (!noindex || inSitemap) failures += 1
}
const mustBeGone = ['/services/ai-chatbots-agents/', '/admin-secret/']
for (const path of mustBeGone) {
  const { response } = await get(path)
  const ok = [404, 308, 301].includes(response.status)
  console.log(`${ok ? ' ok ' : 'FAIL'} ${path} -> ${response.status}`)
  if (!ok) failures += 1
}

const robots = (await get('/robots.txt')).body
const robotsOk = /Disallow: \/admin\//.test(robots) && /Disallow: \/api\//.test(robots) && /Sitemap: /.test(robots)
console.log(`${robotsOk ? ' ok ' : 'FAIL'} robots.txt blocks /admin/ and /api/ and names the sitemap`)
if (!robotsOk) failures += 1
const llms = await get('/llms.txt')
console.log(`${llms.response.status === 200 && llms.body.startsWith('# ') ? ' ok ' : 'FAIL'} llms.txt (${llms.response.status})`)
if (llms.response.status !== 200) failures += 1

console.log(failures ? `\n${failures} problem(s) found.` : '\nAll checks passed.')
process.exit(failures ? 1 : 0)
