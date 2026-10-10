# Pentox Studio — LOCKED Scope (final, 2026-10-10)

This file is the single source of truth. Where any earlier file (01–06) conflicts with this one, **this file wins**.

---------------------------------------------------------------------
## 1. Stack & environment

| Layer | Choice |
|---|---|
| App | **Next.js (App Router, TypeScript) + Payload CMS 3** in one app, scaffolded with `create-payload-app` (blank template) at the `pentox-studio/` project root |
| Database | **PostgreSQL 17 + pgvector** — local dev in Docker (`pentox-db`, port 5432); production Postgres in Docker on Hostinger |
| Media | Local disk (`/media`) in dev and on the server; served via Next/Payload |
| AI chatbot | **Groq API** (OpenAI-compatible, model set via env) + **local embeddings** (Transformers.js, small open-source model) stored in **pgvector** |
| Email | **SMTP via Nodemailer** (`@payloadcms/email-nodemailer`) — Gmail App Password or Hostinger mailbox (`hello@pentoxstudio.com`). Provider is env-driven; a bulk provider (Brevo/Resend) can be swapped in later for newsletters |
| Domain / hosting | Domain at **Namecheap**, hosting at **Hostinger** (VPS preferred: Docker + Nginx + Let's Encrypt). DNS optionally via Cloudflare |
| Booking | Cal.com or Calendly embed (URL from CMS settings) |
| Analytics | GA4 + GTM, Microsoft Clarity, Search Console — loaded **only after cookie consent** |
| Spam protection | Honeypot + DB rate-limit always; Cloudflare Turnstile if `TURNSTILE_SECRET` is set |
| Dev machine | **Windows 10, PowerShell 5.1, no admin rights**, Node 24, pnpm, Git, Docker Desktop. All scripts must run in PowerShell (no bash-only commands, no sudo). Another Docker project already uses ports 8000/8080/3307/5173 — use **3000** (app) and **5432** (db) |

**Not used:** Vercel, Neon, Resend (for now), OpenAI.

---------------------------------------------------------------------
## 2. Brand & design
- Colours: navy `#1C244B`, red `#DD2C33`, body `#4A4A4A`, muted `#71747B`, bg `#FAFAFA`/`#F5F5F5`, accent blue `#467FF7` (links only). Fonts: Poppins (headings) + Inter (body).
- Layout patterns from `06-design-merge.md` (overhang service cards, navy projects carousel, clients logo grid, single-slide testimonials, brand strip, filter pills, portrait project cards, squiggle divider, back-to-top, compact header + full-screen menu, blob/hatch background).
- **Not used from 06:** the preloader (removed).

---------------------------------------------------------------------
## 3. Services (10) — grouped mega menu

| Group | Service | URL |
|---|---|---|
| Marketing | Digital Marketing | `/services/digital-marketing/` |
| | Social Media Marketing | `/services/social-media-marketing/` |
| | SEO | `/services/seo/` |
| | └ Local SEO | `/services/seo/local-seo/` |
| Design & Media | Graphic Design | `/services/graphic-design/` |
| | └ Printing & Design | `/services/graphic-design/printing-design/` |
| | Video Editing | `/services/video-editing/` |
| Development & AI | Web Development (incl. custom web apps: React/Next/Node/APIs + WordPress/Shopify/Wix) | `/services/web-development/` |
| | **AI Chatbots & AI Agents** (new) | `/services/ai-chatbots-agents/` |
| | **Custom CMS & CRM Development** (new) | `/services/custom-cms-crm-development/` |
| | **Cloud Deployment & DevOps** (new) | `/services/cloud-devops/` |
| | **Mobile App Development** (new) | `/services/mobile-app-development/` |

Every service gets: service page (shared template), mega-menu + services grid entry, portfolio filter, contact-form option, blog category. No separate "Custom Web Development" page.
Copy for the 4 new services is drafted in the same tone as existing pages and flagged `TODO: client review`.

---------------------------------------------------------------------
## 4. Sitemap

```
/                                 Home
/services/                        Services hub
/services/<service>/[<sub>/]      10 services + 2 sub-services
/industries/                      Industries hub
/industries/<industry>/           restaurants, healthcare, real-estate, ecommerce, education (editable)
/locations/<city>/                ONLY if real local content exists (collection ready, nothing seeded)
/portfolio/  /portfolio/<slug>/
/pricing/
/cost-estimator/
/free-audit/
/blog/  /blog/<slug>/  /blog/category/<slug>/  /blog/author/<slug>/
/about-us/  /contact-us/  /book-a-call/
/thank-you/                       noindex
/newsletter/confirmed  /newsletter/unsubscribe   noindex
/privacy-policy/  /terms/  /cookie-policy/
/admin                            Payload CMS
```
Trailing slashes ON everywhere (matches the old WordPress URLs).

---------------------------------------------------------------------
## 5. Global elements (every page)
- **Header:** top bar (phone, email, socials) → logo, grouped mega menu (Marketing / Design & Media / Development & AI), Industries, Portfolio, Pricing, Blog, About, Contact, red **"Free Audit"** CTA. Shrinks on scroll; mobile = full-screen navy menu.
- **Breadcrumbs** (all pages except Home) + BreadcrumbList schema.
- **Floating:** WhatsApp (bottom-left), AI chatbot launcher, back-to-top (bottom-right).
- **Mobile sticky bar:** Call · WhatsApp · Get Quote.
- **Pre-footer CTA band:** "Get your free audit" + Free Audit / Book a Call buttons + **multi-step form** (service → budget & timeline → contact).
- **Footer:** brand strip (logo + statement), grouped service links, industries, company links, contact details, socials, newsletter signup, privacy/terms/cookies, copyright.
- **Cookie consent banner** (analytics only load after consent).

---------------------------------------------------------------------
## 6. Page sections

**Home `/`**
1. Hero — real HTML headline, value line, Free Audit + View Services, trust line (real numbers only)
2. Client logo strip
3. Services — overhang illustration cards, 3 groups, arrow buttons
4. Stats strip (real numbers from CMS; hidden if empty)
5. Projects carousel (navy panel, featured case studies, "All Projects")
6. Results — 3 mini case-study cards with headline numbers
7. How we work — 4 steps (Free audit → Proposal → Build → Grow)
8. Industries we serve — icon grid
9. Cost-estimator teaser
10. Testimonials — real only; Google reviews + badges; **section hidden when no real testimonials exist**
11. Latest 3 blog posts
12. FAQ (FAQPage schema)
13. Pre-footer CTA band + footer

**Services hub `/services/`** — hero → 3 groups of service cards → Why Pentox (verifiable only) → How we work → featured case studies → pricing teaser → FAQ → CTA band.

**Service template (all 12 service/sub-service pages)**
1. Hero (keyword H1, problem solved, Free Audit + Book a Call, illustration, trust line)
2. What's included (deliverables grid)
3. Our approach (6 numbered image cards)
4. Results (1–2 case-study highlights)
5. Packages / starting-from (if the service has packages)
6. Tools & technologies (logo row)
7. Industries chips
8. Why choose Pentox (icon cards — no unverifiable claims)
9. CTA banner "Let's Grow Together" + estimator link
10. FAQ 6–8 (FAQPage schema)
11. Related projects (by service tag)
12. Related blog posts (by matching category)
13. Sub-service links
14. Pre-footer form with this service pre-selected

**Industries hub & industry page** — hero → industry challenges → recommended services → industry case studies → stats → FAQ → CTA.

**Portfolio `/portfolio/`** — hero ("Our Projects" eyebrow + red headline) → filter pills (URL-synced) → portrait card grid with animated filtering → stats → CTA.

**Case study `/portfolio/<slug>/`** — intro (name, client logo, summary, "We worked on:" deliverables, industry/service tags) → hero image → challenge → solution → results (big numbers) → gallery + lightbox → real testimonial (if any) → tools used → next project → CTA.

**Pricing `/pricing/`** — hero → package cards per service (Starter/Growth/Pro, "starting from") → comparison table → "Need something custom?" (estimator + book a call) → pricing FAQ → CTA. Prices come from CMS; placeholders flagged TODO.

**Cost estimator `/cost-estimator/`** — hero → wizard (service → scope/features → timeline → price range → email/WhatsApp to unlock detailed quote = lead) → "what affects price" content → FAQ. Price rules editable in CMS.

**Free audit `/free-audit/`** — hero ("Free SEO & Website Audit in 48 Hours") + what you get → short form (website URL, email/WhatsApp, main goal) → sample audit preview → proof → FAQ.

**Blog `/blog/`** — hero + search → featured post → category filter → grid + pagination (9/page) → newsletter → CTA.
**Post `/blog/<slug>/`** — title, author, published + updated dates, reading time, cover → TOC → content with mid-article CTA block → "Related service" box → author bio → share → related posts → newsletter → CTA.
**Author `/blog/author/<slug>/`** — bio, expertise, socials → posts.

**About `/about-us/`** — hero → story & mission → values (Creative / Strategic / Innovative) → team (real photos) → stats → client logos → office (Lahore) + international reach → CTA.

**Contact `/contact-us/`** — hero → 2 columns (multi-step form | phone, WhatsApp, email, address, hours, socials) → booking embed → Google Map → FAQ.

**Book a call `/book-a-call/`** — hero → Cal.com/Calendly embed → "what we'll cover" → testimonial (if real).

**Thank you `/thank-you/`** (noindex) — confirmation + response time → WhatsApp → Book a call → case studies; fires conversion events.

**Newsletter pages, Privacy, Terms, Cookie policy, 404** (404: search, popular services, CTA).

---------------------------------------------------------------------
## 7. Lead-conversion features (all 10)
1. Free audit / free proposal as the main CTA everywhere
2. Project cost estimator (lead captured before detailed quote)
3. Book-a-call (Cal.com/Calendly)
4. AI chatbot (Groq) — answers from site content only, qualifies (service, budget, timeline), saves lead + transcript to CMS, falls back to WhatsApp on failure, daily usage cap, prompt-injection guard
5. Multi-step contact form (service pre-selected on service pages)
6. Mobile sticky bar: Call / WhatsApp / Get Quote
7. Real proof only: case studies with numbers, stats strip, client logos, Google reviews widget (manual entry in CMS; Places API optional later), Upwork/Clutch/Partner badges
8. Packages / starting-from pricing
9. Industries pages
10. Speed-to-lead + tracking: instant auto-reply, email alert per lead (WhatsApp alert optional later), UTM + referrer + landing page stored on every lead, GA4/GTM events (form_start, form_submit, estimator_complete, audit_request, chat_lead, call_click, whatsapp_click), Clarity

## 8. Removed (not fixed)
1. Skill progress bars
2. Generic/silhouette testimonials (David R., Emily P., Abdul Rehman placeholders)
3. Preloader animation
4. Hero banner image with baked-in text
5. Unverifiable claims ("24/7 support", guarantees)
6. Flat services dropdown (→ grouped mega menu)
7. Thin/duplicate pages: `/gallery/`, `/home-new/`, all lorem/placeholder content, duplicate "Top Digital Marketing Agency in Pakistan" posts (keep the best one, 301 the others)

---------------------------------------------------------------------
## 9. SEO architecture
- Hub & spoke URLs (section 4); blog categories mirror services; automatic internal links: post → its service page, service page → its latest posts + projects.
- **301 map (Redirects collection, seeded):** every old URL → new URL, e.g. `/seo/` → `/services/seo/`, `/social-media-marketing/` → `/services/social-media-marketing/`, `/web-development/` → `/services/web-development/`, `/graphic-designing/` → `/services/graphic-design/`, `/video-editing/` → `/services/video-editing/`, `/digital-marketing/` → `/services/digital-marketing/`, `/local-seo/` → `/services/seo/local-seo/`, `/printing-designing-services/` → `/services/graphic-design/printing-design/`, `/service/` → `/services/`, `/gallery/` → `/contact-us/`, `/home-new/` → `/`, `/about-us/` (new page, no redirect), every `/YYYY/MM/<old-slug>/` → `/blog/<clean-slug>/`; old `https-pentoxstudio-com-*`, `blog-*`, `url-slug-*` slugs cleaned.
- SSR/ISR, Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms), `next/image`, `next/font`, minimal client JS.
- `sitemap.xml` (pages, services, industries, posts, portfolio, authors), `robots.txt`, canonical on every page, `noindex` on thank-you/newsletter/search/filtered pages.
- Schema: Organization, LocalBusiness (Lahore NAP), Service, FAQPage, BlogPosting, BreadcrumbList, Person; Review only for genuine reviews.
- CMS SEO fields on every doc (meta title/description with counters, focus keyword, OG image, canonical override, noindex) + pre-publish SEO checklist warnings; required image alt text.
- Author pages, visible updated dates, Q&A sections, `llms.txt`, consistent NAP.

---------------------------------------------------------------------
## 10. CMS (Payload) — collections & globals
**Collections:** Users (admin/editor/author, 2FA-ready), Media, Pages (legal/simple pages), Services, ServiceGroups, Industries, Locations, Posts, Categories, Tags, Authors (or Users profile), Portfolio, PortfolioCategories, Clients, Testimonials, Reviews, Badges, Packages, EstimatorRules, FAQs, Leads (multi-step form, audit, estimator, chatbot; status New → Contacted → Proposal → Won/Lost; UTM fields; notes), ChatSessions (transcripts), KnowledgeChunks (pgvector embeddings), Subscribers, Campaigns, Redirects.
**Globals:** SiteSettings (NAP, hours, WhatsApp, socials, booking URL, analytics IDs, response-time text), Header (mega menu), Footer (brand strip, links), Home (section toggles + content), Stats, ChatbotSettings (system prompt, model, daily cap, enabled).
**Admin:** branded, grouped nav (Content / Leads & Audience / Media / Settings), dashboard (leads this month by source, posts, drafts, scheduled, subscribers, pending, chats), CSV import/export for subscribers and leads, drafts + autosave + scheduled publish + live preview for Posts, Portfolio, Services, Pages; on-demand revalidation.

---------------------------------------------------------------------
## 11. Security, ops, legal
- Admin 2FA (or strong-password + rate-limited login), rate limits on all public endpoints, security headers (CSP, HSTS, X-Frame-Options, etc.), env-validated secrets, admin route not linked publicly.
- Daily Postgres + media backups (script + cron on server, off-server copy), UptimeRobot, error logging.
- Staging at `new.pentoxstudio.com` before cut-over; full backup of the old WordPress site kept.
- Cookie consent, Privacy Policy, Terms, Cookie Policy.
- Email DNS: SPF, DKIM, DMARC for `pentoxstudio.com`.
- Editor guide (`docs/EDITOR-GUIDE.md`).

---------------------------------------------------------------------
## 12. Content still needed from the client (seed with TODO placeholders until provided)
Logo files, copy review for 4 new services, 3–6 real case studies with numbers, package prices, estimator price rules, target industries, team photos/roles, real testimonials + Google Business Profile link, client logos (with permission), office hours, response time, booking URL.
