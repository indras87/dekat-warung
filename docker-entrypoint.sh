#!/bin/sh
set -e

echo "[entrypoint] waiting for Postgres & syncing schema (prisma db push)…"
./node_modules/.bin/prisma db push --skip-generate

echo "[entrypoint] seeding demo data (idempotent)…"
node prisma/seed.mjs || echo "[entrypoint] seed skipped"

echo "[entrypoint] starting Next.js on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}…"
exec ./node_modules/.bin/next start -H "${HOSTNAME:-0.0.0.0}" -p "${PORT:-3000}"
