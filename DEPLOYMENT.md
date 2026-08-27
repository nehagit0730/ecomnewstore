# Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)
- Resend API key (email)
- Razorpay / Stripe keys (payments)
- Cloudflare R2 credentials (images)

## Environment Variables

Copy `.env.example` to `.env.local` and fill all values.

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Local Development

```bash
# Start PostgreSQL
docker compose up -d

# Install & migrate
npm install
npx prisma migrate dev --name init
npm run db:seed

# Run app (frontend + API on one port)
npm run dev
```

Open http://localhost:3000

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: http://localhost:3000/api/products

## Production (Vercel + Neon)

1. Create Neon PostgreSQL database
2. Set `DATABASE_URL` in Vercel env
3. Set `AUTH_SECRET`, `AUTH_URL`, payment & R2 keys
4. Deploy from GitHub
5. Run migrations: `npx prisma migrate deploy`

## Deprecated

The `backend/` NestJS folder is **no longer used**. All logic lives in this Next.js app.
