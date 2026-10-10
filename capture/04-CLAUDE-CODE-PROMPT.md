# Paste-ready prompt for Claude Code

Put this whole `pentox-capture/` folder in the root of an empty project folder as `/capture`, then paste everything below the line into Claude Code.

---

Build a modern, production-ready React redesign of the Pentox Studio website (a Lahore-based digital marketing agency). All source content, design tokens, and screenshots of the current site are in `./capture/`:

- `capture/01-design-system.md` — colours, typography, components, layout patterns
- `capture/02-site-content.md` — every page's copy, images, links, in order (⚠ = live-site issues to fix)
- `capture/03-blog-posts.json` — 34 blog posts (title, slug, date, image, excerpt, REST source)
- `capture/screenshots/*.jpg` — current visual reference (look at them before designing)

## Stack
- Vite + React 18 + TypeScript
- Tailwind CSS (put the brand tokens from 01-design-system.md in `tailwind.config.ts`: navy `#1C244B`, red `#DD2C33`, text `#4A4A4A`, light bg `#F5F5F5`/`#FAFAFA`, accent blue `#467FF7`)
- React Router v6, `react-helmet-async` for per-page title/meta/OG
- Framer Motion for entrance animations (subtle fade-up, staggered cards, animated progress bars on scroll)
- `lucide-react` for icons (map each Font Awesome icon in the content file to the closest Lucide icon)
- Fonts: Poppins (headings) + Inter (body) via Google Fonts

## Architecture
- All copy lives in typed data files, not in JSX: `src/content/site.ts` (business info, nav, footer), `src/content/services.ts` (one object per service page: slug, hero, approach[6], cta, whyChoose[8], seo), `src/content/home.ts`, `src/content/testimonials.ts`, `src/content/printing.ts`, `src/content/localSeo.ts`, `src/content/blog.ts` (import 03-blog-posts.json).
- Copy text EXACTLY from 02-site-content.md, except fix every ⚠ item (rewrite placeholder/lorem text with sensible agency copy, fix "Pakistann", complete the cut-off home paragraph, fix the mismatched Local SEO FAQ answer, remove countdown/lorem widgets).
- Images: use the absolute URLs `https://pentoxstudio.com` + path for now, via one helper `asset(path)` so they can be swapped to local `/public` files later. Unsplash URLs stay as-is with `?w=1200&q=80&auto=format`.

## Pages / routes
`/` Home · `/services` · `/digital-marketing` · `/social-media-marketing` · `/seo` · `/web-development` · `/video-editing` · `/graphic-designing` · `/local-seo` · `/printing-designing-services` · `/portfolio` · `/blog` · `/blog/:slug` · `/contact-us` · `/about-us` (NEW — build from the "Creative / Strategic / Innovative" and "Services" copy in the home-new section + skills + testimonials) · 404 page.
Add redirects: `/service` → `/services`, `/gallery` → `/contact-us`, and old post URLs `/:year/:month/:slug` → `/blog/:slug`.

## Shared components
`TopBar`, `Header` (sticky, Services dropdown, mobile drawer), `Footer` (navy with wavy SVG top edge), `ContactFormSection` (pre-footer: artwork left, form right — Name*, Telephone*, Services* multi-select, Email*, Message; client-side validation with react-hook-form + zod; submit to a `VITE_FORM_ENDPOINT` env var with a TODO and graceful success/error states), `WhatsAppButton` (floating, wa.me link), `SectionHeading`, `ServiceCard`, `ApproachCard` (image bg + dark overlay + number badge), `WhyChooseCard` (icon card), `CtaBanner` (full-bleed image, "Let's Grow Together"), `SkillsSection` (animated bars), `TestimonialsSlider`, `FaqAccordion`, `BlogCard`, `PageHero`.
Build ONE `ServicePage` template component driven by `services.ts` and use it for all 6 service routes.

## Design direction
Keep the brand (navy + red, logo, agency tone) but make it look like a premium 2026 agency site: real HTML hero headline instead of text baked into an image ("Let's Get That Growth You Have Been Waiting For", red underline on "Growth", 6 service icon chips, two CTAs: Get Quote + View Services), generous whitespace, consistent 8px spacing scale, rounded-2xl cards, softer shadows, keep the staggered card grids and the subtle grey blob/hatch background pattern as a decorative motif. Fully responsive (mobile-first), accessible (semantic headings, alt text, focus states, contrast AA), Lighthouse 90+.

## Blog
`/blog` = grid from blog.ts with category filter + pagination (9/page). `/blog/:slug` fetches the post body at runtime from `https://pentoxstudio.com/wp-json/wp/v2/posts?slug=<slug>` (render sanitized HTML with DOMPurify, styled with `@tailwindcss/typography`), with loading skeleton and fallback to the excerpt if the fetch fails. Also add `scripts/export-posts.mjs` that downloads all post bodies into `src/content/posts/*.json` so the site can go fully static later.

## Deliverables
1. Working app (`npm run dev`, `npm run build` with no TS errors).
2. `README.md` with setup, env vars, how to edit content, and a checklist of the ⚠ items you fixed.
3. Work page by page: scaffold + design tokens + layout first, then Home, then the ServicePage template, then the remaining pages. After each page, compare against the matching screenshot and tell me what changed.
