# MASTER BUILD PROMPT — Pentox Studio (paste into Claude Code)

Run Claude Code from `C:\Users\nabee\Desktop\pentox-studio\web` (the folder created by `create-payload-app`). Supersedes `04-…` and `05-…`. Paste everything below the line.

---

You are building the new **Pentox Studio** website + CMS (a digital marketing & development agency in Lahore, Pakistan). The Next.js + Payload CMS 3 app has already been scaffolded in the current folder (the project root) with the **blank** template and the **Postgres** adapter. Read the spec files first, then build in phases and **stop after each phase** so I can test.

## Spec files (in `./capture/`) — read all before writing code
1. `07-LOCKED-SCOPE.md` — **single source of truth.** Wins every conflict.
2. `06-design-merge.md` — layouts/components (ignore its preloader; it was removed).
3. `01-design-system.md` — brand assets, colours, typography.
4. `02-site-content.md` — existing page copy, images, links (reuse copy, but obey the removals in 07 §8).
5. `03-blog-posts.json` — 34 posts to migrate.
6. `screenshots/` — current site, for reference only.
7. `05-CLAUDE-CODE-PROMPT-CMS.md` — older prompt; reuse its CMS ideas (subscribers double opt-in, campaigns, admin dashboard) but **its stack is outdated** (no Vercel, Neon, Resend, OpenAI).
8. `reference-sdcoms-design-spec.md` — layout reference only; never copy its brand, text, images or logos.

## Environment rules (strict)
- Windows 10, **PowerShell 5.1, no admin rights**. Every script/command you give me must work in PowerShell. No bash-only syntax, no `sudo`, no global installs beyond `pnpm`.
- Package manager: **pnpm**. Node 24.
- Postgres 17 + pgvector already runs in Docker as `pentox-db` on `localhost:5432` (compose file in `.\docker-compose.yml`). `DATABASE_URL=postgres://pentox:pentox_dev_pass@localhost:5432/pentox`. Use Payload **migrations** (`payload migrate:create` / `migrate`), and enable `CREATE EXTENSION IF NOT EXISTS vector` in a migration.
- App port **3000**. Ports 8000, 8080, 3307, 5173 are used by another project — don't touch them.
- Keep `.env` out of git; create `.env.example` listing every variable; validate env at startup with zod and fail with a clear message.

## Stack decisions (from 07 §1)
- Next.js App Router + TypeScript strict + Payload 3 (route groups `(frontend)` and `(payload)`).
- Tailwind CSS + `@tailwindcss/typography`; tokens: navy `#1C244B`, red `#DD2C33`, body `#4A4A4A`, muted `#71747B`, bg `#FAFAFA`/`#F5F5F5`, accent `#467FF7`; fonts Poppins + Inter via `next/font`.
- Framer Motion (subtle scroll reveals only, respect `prefers-reduced-motion`), `lucide-react`, Swiper for carousels, react-hook-form + zod.
- Rich text: Lexical with blocks (Callout, CTA, FAQ, YouTube embed).
- Email: `@payloadcms/email-nodemailer` with SMTP from env (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `LEAD_NOTIFY_TO`). Works with Gmail App Password or Hostinger mail. Wrap sending in `src/lib/email/` so the provider can be swapped later.
- AI: **Groq** via its OpenAI-compatible endpoint (`GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_BASE_URL`). Embeddings: **local** `@huggingface/transformers` small sentence-embedding model (configurable via `EMBEDDING_MODEL`), vectors in Postgres **pgvector**. No other AI provider.
- Media on local disk (`/media`), image sizes: thumbnail 400w, card 800w, portrait 644x972, hero 1600w, og 1200x630; webp; alt text required.
- Plugins: `@payloadcms/plugin-seo`, `@payloadcms/plugin-redirects` (or an equivalent custom Redirects collection + middleware), `@payloadcms/plugin-search` optional.
- `trailingSlash: true` in `next.config`.

## Build phases — stop after each, show me what changed and how to verify in PowerShell + browser

**Phase 1 — Foundation**
Env validation, Tailwind tokens, fonts, base layout, Payload config (Users with roles admin/editor/author, Media), admin branding (Pentox logo/colours, title suffix "– Pentox CMS", grouped nav), first migration incl. pgvector, `pnpm dev` working at `http://localhost:3000` and `/admin`. Create first admin via the admin UI.

**Phase 2 — CMS model**
All collections and globals from 07 §10 with access control, drafts/versions/autosave/scheduled publish/live preview where listed, SEO fields on every page-like collection, slug fields, hooks (reading time, revalidation, `updatedAt` shown). Seed script `pnpm seed` (idempotent, PowerShell-safe) that loads: site settings/NAP, header mega menu (3 groups), footer, 10 services + 2 sub-services (reuse copy from 02; draft the 4 new services and mark `TODO: client review`), service groups, 5 industries, FAQs, categories mirroring services, packages + estimator rules with TODO prices, the full 301 redirect map from 07 §9. **Do NOT seed** the placeholder testimonials, skill bars, gallery or home-new content.

**Phase 3 — Global layout**
Top bar, compact-on-scroll header with grouped mega menu + full-screen mobile menu, breadcrumbs + schema, footer with brand strip, WhatsApp button, back-to-top, mobile sticky bar, cookie consent (analytics load only after consent), squiggle divider, blob/hatch background, 404 page.

**Phase 4 — Core pages**
Home (all 13 sections in 07 §6, sections hide when their CMS data is empty), Services hub, Service template for all 12 service pages under `/services/…`, Industries hub + industry pages, About, Contact (with map + booking embed), Book a call, legal pages, Thank-you (noindex). JSON-LD per 07 §9.

**Phase 5 — Lead engine**
Multi-step form component (used in pre-footer band, contact page, service pages with service pre-selected), Free-audit page + form, Cost estimator wizard (rules from CMS; lead captured before showing the detailed quote), all saved to **Leads** with UTM/referrer/landing page (store first-touch UTMs in a cookie), honeypot + rate limit + optional Turnstile, instant auto-reply + email alert to `LEAD_NOTIFY_TO`, redirect to `/thank-you/`, GA4/GTM `dataLayer` events from 07 §7. Admin: lead statuses, notes, CSV export, dashboard counts by source.

**Phase 6 — Portfolio & proof**
Portfolio grid with URL-synced filter pills and animated filtering, case-study page, Clients logo grid, Stats strip, Reviews/Badges, Testimonials (real only — section hidden if none), Projects carousel on Home.

**Phase 7 — Blog**
Blog list (search, category filter, featured, pagination 9), post page (TOC, mid-article CTA, related service box, author bio, share, related posts, newsletter), category + author pages, RSS. Script `pnpm migrate:wp` that reads `./capture/03-blog-posts.json`, fetches each body from its `source` URL, downloads images into Media, converts HTML → Lexical, cleans slugs, keeps original dates, creates a redirect from the old `/YYYY/MM/slug/` URL to `/blog/<clean-slug>/`, imports only one of the duplicate "Top Digital Marketing Agency in Pakistan" posts (301 the others to it). `--dry-run` flag + summary table.

**Phase 8 — Subscribers & newsletters**
Newsletter signup component, `/api/subscribe` with double opt-in, confirm + unsubscribe (one-click, List-Unsubscribe header), Subscribers CSV import/export, Campaigns with test send and batched SMTP sending via a Payload job (throttled for Gmail/Hostinger limits, resumable, progress stats). Post → "create newsletter draft" option (never auto-send).

**Phase 9 — AI chatbot**
Indexing job: chunk Services, FAQs, Packages, Industries, Posts, SiteSettings → embed locally → store in KnowledgeChunks (pgvector); re-index on publish via hooks + manual "Re-index" button. `/api/chat` streaming endpoint: retrieve top chunks, answer with Groq using a system prompt from ChatbotSettings (answer only from Pentox content, never invent prices/claims, suggest Free Audit / Book a call), tool-call `capture_lead` (name, email/WhatsApp, service, budget, timeline) → Leads (source = chatbot). Guards: rate limit per IP, daily usage cap, prompt-injection filtering, max tokens, graceful fallback to "Chat on WhatsApp". Transcripts saved in ChatSessions. Floating chat widget, accessible and mobile-friendly.

**Phase 10 — SEO, performance, security, ops**
Dynamic `sitemap.xml`, `robots.txt`, canonicals, noindex rules, `llms.txt`, pre-publish SEO checklist warnings in admin, security headers, Lighthouse pass (target 90+ all categories, CWV targets in 07 §9), accessibility pass (AA). Add: `docs/DEPLOY-HOSTINGER.md` (Docker Compose prod: app + Postgres + Nginx + Let's Encrypt, staging on `new.pentoxstudio.com`, DNS steps at Namecheap, SPF/DKIM/DMARC, cut-over checklist), `scripts/backup.ps1` + Linux `backup.sh` (Postgres dump + media, off-server copy), `docs/EDITOR-GUIDE.md`, and `README.md` (setup on Windows/PowerShell, env vars, scripts, content TODO list from 07 §12, checklist of every removal and fix).

## Rules for every phase
- Follow 07 exactly; if something is ambiguous, ask me before guessing.
- Never invent statistics, reviews, client names, prices or claims — use CMS fields with `TODO` placeholders and hide empty sections.
- Keep copy and data in the CMS (seeded), not hard-coded in JSX.
- Run `pnpm build` and `pnpm lint`/`tsc --noEmit` at the end of each phase and fix errors before stopping.
- At each stop, give me: what was built, the PowerShell commands to run, the URLs to open, and what I should see.
