# syntax=docker/dockerfile:1
# Dekat Warung — containerized production image (Next.js 15 + Prisma + PostgreSQL)
# Multi-stage. All stages use Alpine so Prisma's engine binaries match the
# runner's musl libc.

# ---- deps: install node_modules (incl. prisma CLI + engines) ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---- builder: generate client + build Next.js ----
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client for the build, then build Next.js.
# No live DB is needed: DB-backed pages are `export const dynamic`.
RUN npx prisma generate && npm run build

# ---- runner: minimal runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy built app + node_modules (prisma CLI needed at startup for db push/seed).
COPY --from=builder --chown=app:app /app /app
COPY --chown=app:app docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER app
EXPOSE 3000

# Runs: prisma db push (create/sync schema) → seed demo data → next start
CMD ["./docker-entrypoint.sh"]
