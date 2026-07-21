# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH"
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

# --- deps ---
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Skip broken native postinstalls (sharp / unrs-resolver) inside CI/Docker
RUN printf 'allowBuilds:\n  sharp: false\n  unrs-resolver: false\nignoredBuiltDependencies:\n  - sharp\n  - unrs-resolver\n' > pnpm-workspace.yaml \
  && pnpm install --frozen-lockfile

# --- build ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# BACKEND_URL is only used at runtime by rewrites, but Next may read config at build.
ARG BACKEND_URL=http://127.0.0.1:8080
ENV BACKEND_URL=$BACKEND_URL
RUN pnpm build

# --- run ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    BACKEND_URL=http://127.0.0.1:8080

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js is produced by next standalone
CMD ["node", "server.js"]
