# Veloire — Premium Fashion Ecommerce

**Single Next.js 15 application** — frontend, API, and database in one project.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind, Shadcn, Framer Motion |
| State | Zustand (cart UI), TanStack Query |
| Backend | Next.js Route Handlers + Server Actions |
| Database | PostgreSQL + Prisma |
| Auth | Auth.js (NextAuth v5) |
| Email | Resend |
| Payments | Razorpay, Stripe |
| Storage | Cloudflare R2 |

## Quick Start

```bash
# 1. Environment
cp .env.example .env.local
# Set DATABASE_URL and AUTH_SECRET (openssl rand -base64 32)

# 2. Database (Docker)
docker compose up -d

# 3. Setup
npm install
npx prisma migrate dev --name init
npm run db:seed

# 4. Run — ONE server for everything
npm run dev
```

Open **http://localhost:3000**

| URL | What |
|-----|------|
| http://localhost:3000 | Storefront |
| http://localhost:3000/admin/login | Super admin sign in |
| http://localhost:3000/admin | Admin panel (after sign in) |
| http://localhost:3000/vendor/login | Vendor sign in |
| http://localhost:3000/vendor | Vendor portal (after sign in) |
| http://localhost:3000/api/products | Products API |
| http://localhost:3000/account/login | Customer sign in |

## Seed Accounts

| Role | Email | Password | Portal |
|------|-------|----------|--------|
| Super Admin | admin@veloire.com | Admin@123 | `/admin/login` → `/admin` |
| Customer | customer@veloire.com | Customer@123 | Storefront |

**Vendors** (all use password `Vendor@123`, sign in at `/vendor/login`):

| Shop | Email |
|------|-------|
| Demo Boutique | vendor@veloire.com |
| Urban Threads Co. | urban@veloire.com |
| Sole Studio | sole@veloire.com |
| Little Luxuries | kids@veloire.com |
| Nordic Loom | accessories@veloire.com |

### Multivendor

- **Super Admin** — full platform control, approve vendor products, manage vendors/orders/customers.
- **Vendor** — add products (pending super-admin approval), view own orders & sales only.

## Architecture

See [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) and [DEPLOYMENT.md](./DEPLOYMENT.md).

The separate `backend/` folder is **deprecated** — do not use it.

## Guest Cart

Send header `x-session-id: <uuid>` with cart API requests for guest shoppers.
