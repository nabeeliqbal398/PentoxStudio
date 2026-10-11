# Pentox Studio

Website and CMS for Pentox Studio: Next.js 16 (App Router, TypeScript) + Payload CMS 3 in one app, with PostgreSQL 17 + pgvector.

The locked project spec is [capture/07-LOCKED-SCOPE.md](capture/07-LOCKED-SCOPE.md). Where other spec files conflict with it, it wins.

Other docs: [docs/EDITOR-GUIDE.md](docs/EDITOR-GUIDE.md) (for content editors) and [docs/DEPLOY-HOSTINGER.md](docs/DEPLOY-HOSTINGER.md) (production server, DNS, backups, cut-over).

## Prerequisites

- Node.js 22 LTS or newer (24 works locally)
- pnpm
- Docker Desktop
- Git

Dev machine assumptions: Windows 10, PowerShell 5.1, no admin rights. Ports used: `3000` (app) and `5432` (Postgres).

## Local setup (PowerShell)

```powershell
# 1. Start Postgres 17 + pgvector (container "pentox-db")
docker compose up -d

# 2. Create your local env file, then fill in PAYLOAD_SECRET and DATABASE_URL
Copy-Item .env.example .env

# 3. Install dependencies
pnpm install

# 4. Create the database tables (also enables the pgvector extension)
pnpm migrate

# 5. Load the starting content (services, menu, FAQs, redirects, settings). Safe to re-run.
pnpm seed

# 6. Start the dev server
pnpm dev
```

Open <http://localhost:3000/admin/> and create your first admin user (the first account is always an Admin).

The app validates `.env` at startup and tells you which variable is wrong. After changing collections, create a migration with `pnpm migrate:create <name>` and apply it with `pnpm migrate`; the schema is never auto-pushed.

Local `DATABASE_URL`: `postgres://pentox:pentox_dev_pass@localhost:5432/pentox` (matches `docker-compose.yml`).

`setup-db.ps1` is a one-shot helper that writes `docker-compose.yml`, starts the container and enables the `vector` extension.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Production build (needs the database up and migrated: a few pages are generated at build time) |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm migrate` | Apply pending DB migrations |
| `pnpm migrate:create <name>` | Create a migration from schema changes (waits for a prompt if nothing changed; Ctrl+C) |
| `pnpm migrate:status` | Show which migrations have run |
| `pnpm seed` | Load starter content; never overwrites existing docs |
| `pnpm seed:demo` | Load clearly-labelled DEMO portfolio/testimonial data for design review. Never use in production |
| `pnpm migrate:wp` | Import the old WordPress posts (as **drafts**) and build the redirect map |
| `pnpm test:int` | Vitest integration tests (needs the dev database) |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm audit:site [url]` | Crawl a running site (default `http://localhost:3000`): status, title, description, one h1, canonical, noindex, alt text, security headers, robots, llms.txt |
| `pnpm check:secrets` | After `pnpm build`: search the browser bundles and prerendered HTML for secret values from `.env` |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` |
| `pnpm generate:importmap` | Regenerate the admin import map (after adding admin components) |
| `scripts\backup.ps1` | Postgres dump + media zip of the local container (+ optional off-machine copy) |
| `scripts/backup.sh` | Same for the production server (see the deploy guide) |

## Environment variables

[.env.example](.env.example) lists every variable with comments; [deploy/.env.production.example](deploy/.env.production.example) is the production version. Summary:

| Group | Variables |
| --- | --- |
| Core (required) | `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL` |
| Email (leads, newsletter) | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `LEAD_NOTIFY_TO` |
| Newsletter limits | `NEWSLETTER_BATCH_SIZE`, `NEWSLETTER_BATCH_DELAY_SECONDS`, `NEWSLETTER_MESSAGE_DELAY_MS`, `NEWSLETTER_DAILY_LIMIT` |
| AI chatbot (server-only) | `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_BASE_URL`, `EMBEDDING_MODEL` |
| Analytics (loaded only after consent) | `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_CLARITY_ID` |
| Spam protection | `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET` (optional) |
| Contact | `BOOKING_URL`, `WHATSAPP_NUMBER` |
| Staging | `NOINDEX_SITE=true` makes the whole site noindex (robots, header, empty sitemap). Empty in production |

Only `NEXT_PUBLIC_*` values reach the browser. Run `pnpm check:secrets` after a build to prove nothing else did.

## SEO, security and ops (Phase 10)

- `/sitemap.xml`: published, indexable pages only (no drafts, thank-you, noindex, filtered/search URLs). `/robots.txt` blocks `/admin/`, `/api/`, `/next/`, `/newsletter/`, `/thank-you/`. `/llms.txt` summarises the site for AI tools. Canonical URL on every page.
- The admin SEO tab has a pre-publish checklist (title/description length, alt text, internal links, duplicate title/slug, noindex notice). Warnings only.
- Security headers (set in `next.config.ts` and `src/proxy.ts`, logic in `src/lib/security.ts`): CSP (GA4/GTM/Clarity origins only after consent, Turnstile only when configured), HSTS (production), nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors. Scripts keep `'unsafe-inline'` because pages are cached (ISR) and cannot carry per-request nonces; no `eval`, no wildcards.
- GraphQL is disabled. Access control for every collection/global is covered by `tests/int/phase10.int.spec.ts`. The admin login is rate-limited (5 tries, 10-minute lock).
- `GET /api/health/` for uptime monitors.
- Production: `Dockerfile`, `docker-compose.prod.yml`, `deploy/` (Nginx, Let's Encrypt, env template). Details in [docs/DEPLOY-HOSTINGER.md](docs/DEPLOY-HOSTINGER.md).

### Deliberate deviation from the design spec

The spec's brand colours failed WCAG AA contrast for small text, so the tokens in `src/app/(frontend)/globals.css` are slightly darker: brand `#c9242a` (active `#a81d22`), accent `#2f5fd0`, muted text `#686b72`. Change them only with a contrast check.

### Performance notes

Lighthouse results and the Core Web Vitals notes are in the Phase 10 report. Measured on a production build: layout shift 0, page weight kept low (WebP backgrounds, Poppins limited to four weights, chat widget loaded only when enabled).

## Content still needed from the client (07 §12)

The site shows TODO placeholders or hides the section until these arrive. Never invent them.

- [ ] Logo files (SVG/PNG, light and dark)
- [ ] Copy review for the 4 new services
- [ ] 3–6 real case studies with real numbers
- [ ] Package prices
- [ ] Cost-estimator price rules (Content → Estimator rules)
- [ ] Target industries
- [ ] Team photos and roles
- [ ] Real testimonials (with permission) + Google Business Profile link
- [ ] Client logos (with permission)
- [ ] Office hours
- [ ] Response time (what we can honestly promise)
- [ ] Booking URL (Cal.com / Calendly)
- [ ] Hosting/DNS/email details for the deploy: VPS IP, mail provider (SPF/DKIM values), backup storage, developer contact for the editor guide

## Removal and fix checklist (07 §8 and the audit fixes)

Each item is verified by tests (`tests/int/phase10.int.spec.ts`) or by `pnpm audit:site`.

Removed (not fixed):

- [x] 1. Skill progress bars: not in the source
- [x] 2. Generic/silhouette testimonials (David R., Emily P., Abdul Rehman placeholders): not in the content; testimonials only from the CMS
- [x] 3. Preloader animation: not in the source
- [x] 4. Hero banner image with baked-in text: the hero is real text over a background image
- [x] 5. Unverifiable claims ("24/7 support", guarantees): none in published content (draft WordPress imports are reviewed before publishing; see the Phase 10 report)
- [x] 6. Flat services dropdown: replaced by the grouped mega menu (3 groups)
- [x] 7. Thin/duplicate pages: `/gallery/`, `/home-new/`, `/service/` and the duplicate "Top Digital Marketing Agency" posts 301-redirect; no lorem/placeholder content

Fixes made during the build:

- [x] Every page has one `<h1>`, a title, a meta description and a canonical URL
- [x] Home page `<title>` was missing: default title added
- [x] Descriptions fall back to a sensible length (`pickDescription`)
- [x] `<hr>` inside `<p>` in rich text caused a hydration error: fixed
- [x] Social share buttons have accessible names (inline SVG icons)
- [x] AA colour contrast on text (token changes above)
- [x] Redirect chains/loops are prevented; redirects are cached
- [x] Drafts are never publicly reachable, in the sitemap, or in the chatbot index
- [x] Analytics only after consent (and the CSP agrees)
- [x] `Accept-CH`/`Critical-CH` (added by the Payload plugin to every route) kept for `/admin` only: it made browsers repeat every public request

## Folder structure

```
capture/            Project spec files (01-08 .md, 03-blog-posts.json, screenshots/)
brain/              Local security notes (not tracked)
docs/               EDITOR-GUIDE.md, DEPLOY-HOSTINGER.md
deploy/             Nginx template, Let's Encrypt bootstrap, production env template
scripts/            audit-site, check-secrets, backup.ps1, backup.sh
src/
  app/(frontend)/   Public site (+ sitemap, robots, llms.txt, health)
  app/(payload)/    Payload admin + API routes
  collections/      Payload collections
  globals/          Payload globals (home, header, footer, settings, labels...)
  components/       UI, sections, blog, chat, admin components
  lib/              content queries, SEO, security headers, email, chatbot
  migrate/          WordPress import
  seed/             Starter and demo content
  proxy.ts          Redirects, security headers, CSP (Next 16 "proxy")
tests/              Vitest (int) and Playwright (e2e) tests
docker-compose.yml        Local Postgres 17 + pgvector ("pentox-db")
docker-compose.prod.yml   Production stack (app, db, nginx, certbot)
Dockerfile                Production image
.env.example              Env template; copy to .env (never commit .env)
```
