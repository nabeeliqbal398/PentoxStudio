# Production image for Pentox Studio (Next.js + Payload). See docs/DEPLOY-HOSTINGER.md.
#
# Build it with docker-compose.prod.yml (it passes the build arguments and gives the build access to the database:
# a few pages such as the home page are generated at build time from the published content, so `next build` needs
# the database to be up and migrated). Debian "slim" is used instead of Alpine because the local embedding model
# (onnxruntime) needs glibc.

FROM node:24-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# ---- dependencies (also used as the "tools" image that runs migrations, seeding and the WordPress import) --------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .

# ---- build ----------------------------------------------------------------------------------------------------
FROM deps AS builder
# Values needed only so the app can start up during `next build`. Real secrets are supplied at run time (.env.prod).
ARG DATABASE_URL
ARG PAYLOAD_SECRET=build-time-only-placeholder-secret
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_CLARITY_ID
ENV DATABASE_URL=$DATABASE_URL \
    PAYLOAD_SECRET=$PAYLOAD_SECRET \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID \
    NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID \
    NEXT_PUBLIC_CLARITY_ID=$NEXT_PUBLIC_CLARITY_ID
RUN pnpm build

# ---- run ------------------------------------------------------------------------------------------------------
FROM builder AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# media/ (uploads) and .cache/ (embedding model) are volumes; .next/cache holds the page cache. All must be writable.
RUN mkdir -p /app/media /app/.cache /app/backups && chown -R node:node /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health/').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["pnpm", "start"]
