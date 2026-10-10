# Pentox Studio

Website and CMS for Pentox Studio: Next.js (App Router, TypeScript) + Payload CMS 3 in one app, with PostgreSQL 17 + pgvector.

The locked project spec is [capture/07-LOCKED-SCOPE.md](capture/07-LOCKED-SCOPE.md). Where other spec files conflict with it, it wins.

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

# 4. Start the dev server
pnpm dev
```

Open <http://localhost:3000/admin> and create your first admin user.

Local `DATABASE_URL`: `postgres://pentox:pentox_dev_pass@localhost:5432/pentox` (matches `docker-compose.yml`).

`setup-db.ps1` is a one-shot helper that writes `docker-compose.yml`, starts the container and enables the `vector` extension.

## Scripts

| Command              | What it does                          |
| -------------------- | ------------------------------------- |
| `pnpm dev`           | Dev server                            |
| `pnpm build`         | Production build                      |
| `pnpm start`         | Serve the production build            |
| `pnpm lint`          | ESLint                                |
| `pnpm test:int`      | Vitest integration tests              |
| `pnpm test:e2e`      | Playwright end-to-end tests           |
| `pnpm generate:types` | Regenerate `src/payload-types.ts`    |

## Folder structure

```
capture/            Project spec files (01-08 .md, 03-blog-posts.json, screenshots/)
brain/              Local security notes (not tracked)
src/
  app/(frontend)/   Public site
  app/(payload)/    Payload admin + API routes
  collections/      Payload collections (Users, Media)
  payload.config.ts Payload configuration
  payload-types.ts  Generated types (tracked)
tests/              Vitest (int) and Playwright (e2e) tests
.claude/skills/     Payload CMS skill for Claude Code
docker-compose.yml  Local Postgres 17 + pgvector ("pentox-db")
setup-db.ps1        Local DB bootstrap script
Dockerfile          App image (production, for later)
.env.example        Env template; copy to .env (never commit .env)
```

## Environment variables

See [.env.example](.env.example) for the full list with comments.
