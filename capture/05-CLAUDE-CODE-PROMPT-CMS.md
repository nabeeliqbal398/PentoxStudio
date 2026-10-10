# Paste-ready Claude Code prompt — Pentox Studio site + CMS (Payload + Next.js)

This REPLACES `04-CLAUDE-CODE-PROMPT.md` (that one was a static Vite SPA). Put the `pentox-capture/` folder in an empty project folder as `./capture`, then paste everything below the line into Claude Code.

---

Build the Pentox Studio website redesign **plus a CMS** as a single Next.js app using **Payload CMS 3**. The public site is a modern agency site; `/admin` is where the team manages the blog, portfolio, newsletter subscribers, and contact leads.

Reference material in `./capture/` (read all of it first):
- `01-design-system.md` — brand colours, typography, components, layouts
- `02-site-content.md` — all page copy, images, links (⚠ = live-site issues you must fix)
- `03-blog-posts.json` — 34 existing posts (to migrate)
- `screenshots/` — current site visuals
- `06-design-merge.md` — **the authoritative design spec**: Pentox colours/fonts applied to the layouts in `reference-sdcoms-design-spec.md` (services overhang cards, navy projects carousel, clients logo grid, testimonial carousel, brand strip, projects page with filter pills, single project page, preloader, squiggle divider, back-to-top, compact header). Where 01 and 06 differ on layout, 06 wins; colours always come from Pentox. It also lists required CMS changes (§5) — apply them to the collections below.
- `reference-sdcoms-design-spec.md` — layout reference only. Do NOT copy its brand name, copy, colours, images or client logos. Ignore its Vite stack/prompt; we use Next.js + Payload.

## 0. Environment constraints
- My machine is a locked-down Windows/domain laptop with **no admin/sudo**. Don't require global installs or a local Postgres service. Use a cloud Postgres (**Neon** free tier) via `DATABASE_URI` for dev and prod. Everything must run with `pnpm` (or `npm`) in user space.
- Provide `.env.example` with every variable, and fail fast with a clear error if one is missing.

## 1. Stack
- Next.js 15 (App Router, TypeScript, Server Components) + **Payload 3** installed inside the Next app (`/app/(frontend)` and `/app/(payload)` route groups), created from the official blank template.
- DB: `@payloadcms/db-postgres` (Neon). Use Payload migrations (`payload migrate:create` / `migrate`), not push, in production.
- Rich text: `@payloadcms/richtext-lexical` with headings, lists, links, quotes, code, tables, upload (inline images), and custom blocks: `CalloutBlock`, `CTABlock` (links to /contact-us), `FAQBlock`, `YouTubeEmbedBlock`.
- Media storage: local in dev; `@payloadcms/storage-vercel-blob` (or `@payloadcms/storage-s3` for Cloudflare R2) in prod, toggled by env. Image sizes: thumbnail 400w, card 800w, hero 1600w, og 1200x630; webp output via sharp; required `alt` field.
- Email: **Resend** via `@payloadcms/email-resend` (transactional + newsletter). `RESEND_API_KEY`, `EMAIL_FROM`.
- Styling: Tailwind CSS + `@tailwindcss/typography`; tokens from 01-design-system.md (navy `#1C244B`, red `#DD2C33`, text `#4A4A4A`, bg `#F5F5F5`/`#FAFAFA`, accent `#467FF7`); fonts Poppins (headings) + Inter (body) via `next/font`.
- Framer Motion for subtle entrance animations; `lucide-react` icons.
- Forms: react-hook-form + zod on the client, same zod schema re-validated on the server.

## 2. Payload collections
**Users** (auth) — name, email, role: `admin` | `editor` | `author`. Access: admins everything; editors manage content + subscribers but not users/settings; authors create/edit their own posts and can't publish.

**Media** — upload collection described above (alt required, caption optional, folder/tag field for filtering).

**Posts** — `versions: { drafts: { autosave: true }, maxPerDoc: 25 }`, scheduled publishing (Payload jobs queue, `publishedAt` in the future = scheduled).
Fields: title, slug (auto from title, unique, editable), excerpt (max 300), coverImage (Media), content (Lexical), categories (rel, hasMany), tags (rel, hasMany), author (Users), status (draft/published via Payload drafts), publishedAt, readingTime (auto-computed in a `beforeChange` hook), featured (checkbox), relatedPosts (rel, hasMany, optional — fallback to same category), `notifySubscribers` (checkbox, default false), and an **SEO group** via `@payloadcms/plugin-seo` (meta title, description, OG image, auto-generate buttons). `legacyUrl` field (e.g. `/2026/09/slug/`) for redirects.

**Categories** / **Tags** — title, slug, description. Seed categories: Digital Marketing, SEO, Social Media, Web Development, Graphic Design, Video, Guides.

**Portfolio** — drafts enabled, fields: title, slug, client name, service (select: Digital Marketing / Social Media Marketing / SEO / Web Development / Video Editing / Graphic Designing / Printing & Design — used for filtering), coverImage, gallery (array of Media + caption), shortDescription, content (Lexical case study: challenge / solution / results), results (array: metric label + value, e.g. "Organic traffic" / "+180%"), projectUrl, videoUrl (YouTube), testimonial (rel to Testimonials, optional), completedAt, featured, sortOrder. Admin list view sorted by sortOrder with drag reordering if feasible, otherwise numeric field.

**Testimonials** — name, role/company, quote, avatar, rating (1–5), featured. Seed with the 3 from the capture.

**Subscribers** — email (unique, lowercased), name (optional), status: `pending` | `active` | `unsubscribed` | `bounced`, source (select: footer form, blog post, popup, import, admin), tags (text hasMany, e.g. "seo", "clients"), confirmToken + confirmTokenExpires (hidden), unsubscribeToken (hidden, permanent, random), confirmedAt, unsubscribedAt, consentIp, consentAt, userAgent. Access: create only via the custom endpoint (no public REST create); read/update for admin/editor.
Admin UX for subscribers:
- list columns: email, name, status, source, tags, createdAt; filters by status/source/tag
- **CSV import** (custom admin view/button: upload CSV with email,name,tags → upsert, skips invalid/duplicates, marks source=import, status active only if a "consent confirmed" checkbox is ticked, otherwise pending + sends confirmation)
- **CSV export** of the current filtered list
- bulk actions: change status, add tag, delete

**Campaigns** (newsletter) — subject, preheader, content (Lexical), audience (all active / by tags), status: `draft` | `scheduled` | `sending` | `sent` | `failed`, scheduledAt, sentAt, stats group (recipients, sent, failed), `sendTestTo` (email field + "Send test" button). Sending runs in a **Payload job** that batches through Resend's batch API (100/request), respects rate limits, records progress, and is resumable. Every email has the List-Unsubscribe header + one-click unsubscribe link + business address in the footer.
Also: when a Post is first published with `notifySubscribers` ticked, auto-create a Campaign draft from it (title, excerpt, cover, "Read more" link) for an editor to review and send — never auto-send.

**ContactSubmissions** (leads from the site form) — name, phone, services (multi-select), email, message, status (new / contacted / won / lost), notes (admin only), createdAt. On create: email notification to `CONTACT_NOTIFY_TO`, plus an auto-reply to the sender. Optional "also subscribe me" checkbox on the form → creates a pending Subscriber.

## 3. Globals
**SiteSettings** — business name, phone, WhatsApp number, email, address, map embed URL, social links, default SEO/OG image, analytics ID.
**Header** — nav items (label, link, children for the Services dropdown), CTA button.
**Footer** — headline ("Let's Build Your Brand"), quick links, copyright text.
**Home** — hero (headline, highlighted word, subtext, CTAs, image), services section, skills (label + percent array), which testimonials to show, intro text. Seed everything from 02-site-content.md (fix the cut-off intro paragraph).
Service pages: put the 6 service pages in a **Services** collection (slug, hero, approach[6]: title/description/image, cta, whyChoose[8]: icon (select of lucide names)/title/description, SEO) and render them with ONE `ServicePage` template. Seed all 6 from the capture, plus Local SEO and Printing & Designing as long-form entries.

## 4. Public endpoints (custom Payload endpoints or Next route handlers)
- `POST /api/subscribe` — {email, name?, source, tags?}; zod validation, **honeypot field + rate limit (5/10min per IP, in-DB or upstash if env set) + optional Cloudflare Turnstile** (`TURNSTILE_SECRET` env, skip if not set). If email is already active → respond success without leaking status. Otherwise create/refresh as `pending` and send a branded **double opt-in** email.
- `GET /api/subscribe/confirm?token=` — activates, redirects to `/newsletter/confirmed`. Expired token → `/newsletter/expired` with resend option.
- `GET|POST /api/unsubscribe?token=` — one-click (POST for RFC 8058) and a `/newsletter/unsubscribe` page with confirm button + optional reason.
- `POST /api/contact` — the contact form (same anti-spam), creates ContactSubmission.
- Never expose subscriber data through the public REST/GraphQL API.

## 5. Public site (frontend route group)
Routes: `/`, `/services`, `/digital-marketing`, `/social-media-marketing`, `/seo`, `/web-development`, `/video-editing`, `/graphic-designing`, `/local-seo`, `/printing-designing-services`, `/portfolio`, `/portfolio/[slug]`, `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/blog/tag/[slug]`, `/contact-us`, `/about-us` (new page — build from the "Creative / Strategic / Innovative" + Services copy in the home-new section of the capture, plus skills and testimonials), `/newsletter/confirmed|expired|unsubscribe`, `not-found`.
- Redirects in `next.config` / middleware: `/service` → `/services`, `/gallery` → `/contact-us`, and every Post `legacyUrl` (`/YYYY/MM/slug/`) → `/blog/slug` (301, generated from the DB).
- Blog: listing with search (title/excerpt), category filter, pagination 9/page, featured post on top; post page with cover, author, date, reading time, table of contents from H2/H3, share buttons, related posts, **newsletter signup box**, and a CTA block.
- Portfolio: filterable grid by service (animated filter), lightbox for galleries, case-study page with results metrics.
- Newsletter signup component used in: footer, end of each blog post, blog sidebar.
- Data fetching via Payload Local API in Server Components; ISR with **on-demand revalidation** in `afterChange`/`afterDelete` hooks (`revalidatePath`/`revalidateTag`) for posts, portfolio, services, globals.
- **Live preview + draft preview** for Posts, Portfolio and Services (Payload live preview with `/preview` route and draft mode).
- SEO: `generateMetadata` from the SEO fields, JSON-LD (Organization, LocalBusiness with the Lahore address, BlogPosting, BreadcrumbList), `sitemap.ts` (pages + posts + portfolio), `robots.ts`, RSS feed at `/blog/rss.xml`.
- Floating WhatsApp button (number from SiteSettings), sticky header with Services dropdown + mobile drawer, footer with wavy navy top edge, all per the design system — modernized (real HTML hero headline, rounded-2xl cards, softer shadows, keep the grey blob/hatch background motif). Mobile-first, accessible (AA contrast, focus states, alt text), Lighthouse 90+.

## 6. Admin customizations
- Brand the admin: Pentox logo/icon (`admin.components.graphics`), navy/red theme, title suffix "– Pentox CMS".
- **Dashboard** (custom `beforeDashboard` component): cards for posts published this month, drafts, scheduled posts, portfolio items, active subscribers (+ new in last 30 days), pending confirmations, unsubscribes, new contact leads; a small subscriber growth chart (last 90 days); quick actions (New post, New project, New campaign, Export subscribers).
- Group collections in the nav: Content (Posts, Categories, Tags, Portfolio, Testimonials, Services), Audience (Subscribers, Campaigns, Contact Submissions), Media, Settings (globals, Users).

## 7. Migration & seed scripts (`/scripts`, run with `pnpm tsx`)
- `seed.ts` — users (admin from env `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`), categories, testimonials, globals, services, home — all from `./capture/02-site-content.md` content. Idempotent.
- `migrate-wp-posts.ts` — for each post in `capture/03-blog-posts.json`, fetch the full body from its `source` URL (WP REST), download the featured image and every `<img>` in the body into Media (dedupe by original URL), rewrite image src, convert HTML → Lexical with `convertHTMLToLexical` from `@payloadcms/richtext-lexical`, map WP categories, set `legacyUrl`, keep original `publishedAt`, status published. Idempotent by slug; `--dry-run` flag; log a summary table. Flag the three near-duplicate "Top Digital Marketing Agency in Pakistan" posts in the summary instead of importing blindly.
- `seed-portfolio.ts` — create 4 draft portfolio items from the 4 images in the capture with placeholder titles marked "TODO" so an editor fills them in.

## 8. Quality & delivery
- Strict TypeScript, generated Payload types (`payload generate:types`), ESLint, no `any`.
- Tests: Vitest for zod schemas, token generation, subscribe/confirm/unsubscribe flow (mock Resend); Playwright smoke test: home renders, blog list → post, subscribe form shows success, admin login page loads.
- `README.md`: setup on a no-admin machine (Node via nvm-windows/fnm user install or portable Node, Neon DB, Resend), env vars, scripts, how editors use the CMS (write post, schedule, preview, send newsletter, import/export subscribers), deployment to **Vercel** (+ Neon + Vercel Blob) and alternative Docker deploy for a VPS, and a checklist of every ⚠ issue from the capture and how it was fixed.
- Work in this order and stop after each phase to show me what was built and how to verify it (commands + what I should see):
  1. Scaffold Next + Payload + Neon + Tailwind tokens, Users/Media, admin branding.
  2. Collections + globals + access control + seed.
  3. Public layout (compact-on-scroll header + hamburger overlay, footer with brand strip, WhatsApp, back-to-top, blob background, squiggle, preloader) + Home (overhang Services cards, navy Projects carousel, Clients logos, Testimonials carousel per 06-design-merge.md) + ServicePage template + remaining static pages.
  4. Blog (list/post/categories/RSS) + WP migration script.
  5. Portfolio + PortfolioCategories + Clients (projects page with filter pills and single project page per 06-design-merge.md §4.6–4.7).
  6. Subscribers: endpoints, double opt-in, unsubscribe, CSV import/export, newsletter signup components.
  7. Campaigns + jobs + post→campaign draft; ContactSubmissions.
  8. Dashboard, SEO/sitemap/JSON-LD, redirects, live preview, tests, README.
