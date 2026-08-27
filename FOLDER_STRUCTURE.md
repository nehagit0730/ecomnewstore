# Veloire — Monolithic Full-Stack Architecture

Single Next.js 15 application (frontend + backend).

```
veloire-store/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── public/
├── src/
│   ├── app/                   # App Router (pages + API)
│   │   ├── api/
│   │   │   ├── auth/          # Auth.js + register + reset
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── collections/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── wishlist/
│   │   │   ├── reviews/
│   │   │   └── admin/
│   │   ├── admin/             # Admin dashboard (protected)
│   │   ├── account/
│   │   ├── collections/
│   │   ├── products/
│   │   └── ...
│   ├── components/            # Shared UI (Shadcn, layout, home)
│   ├── features/              # Feature modules (expand here)
│   ├── server/
│   │   ├── db/                # Prisma client
│   │   ├── repositories/      # Data access layer
│   │   ├── services/          # Business logic
│   │   └── errors/
│   ├── actions/               # Server Actions
│   ├── lib/                   # Client utilities, api-client
│   ├── hooks/
│   ├── config/
│   ├── types/
│   └── utils/
├── docker-compose.yml         # PostgreSQL
├── auth.ts                    # Auth.js config (src/auth.ts)
└── middleware.ts              # Route protection
```

## API Routes (same origin)

| Path | Purpose |
|------|---------|
| `/api/auth/*` | Auth.js sessions |
| `/api/auth/register` | Sign up |
| `/api/products` | Product catalog |
| `/api/cart` | Cart CRUD |
| `/api/orders` | Checkout & history |
| `/api/admin/*` | Admin APIs |

No separate backend server — everything runs on **port 3000**.
