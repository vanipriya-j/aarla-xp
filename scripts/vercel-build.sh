#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is missing. Set the Supabase transaction pooler URL (port 6543)."
  exit 1
fi

if [[ -z "${DIRECT_URL:-}" ]]; then
  echo "DIRECT_URL is missing. Set the Supabase session pooler URL (port 5432 on pooler.supabase.com)."
  exit 1
fi

if [[ "$DIRECT_URL" == *"db."*".supabase.co"* ]]; then
  echo "DIRECT_URL uses db.*.supabase.co. Vercel often cannot reach that IPv6 host."
  echo "Use the session pooler instead: aws-0-ap-northeast-1.pooler.supabase.com:5432"
  exit 1
fi

echo "→ prisma generate"
prisma generate

echo "→ prisma migrate deploy"
prisma migrate deploy

echo "→ seed if empty"
tsx prisma/seed-if-empty.ts

echo "→ next build"
next build
