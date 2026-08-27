# Veloire — Project Folder Structure

This repository is built on **Next.js 15 App Router** with TypeScript, Tailwind CSS, Prisma ORM, NextAuth v5, and Zustand.

---

## 📁 Complete Directory Tree

```text
/
├── prisma/                                  # Database schema & seeding
│   ├── schema.prisma                        # PostgreSQL schema definition
│   ├── seed-data.ts                         # Curated seed products, collections & vendors
│   └── seed.ts                              # Database seed execution script
│
├── public/                                  # Static assets & web manifests
│   └── robots.txt
│
├── scripts/                                 # Database setup & migration helper scripts
│   ├── init-db.sql                          # Initial DB creation SQL
│   ├── migrate-roles.sql                    # SQL role migration script
│   ├── seed-reviews.ts                      # Customer review seed generator
│   └── setup-database.ps1                   # Local setup script
│
├── src/                                     # Application source code
│   │
│   ├── app/                                 # Next.js App Router (Routes & API)
│   │   ├── (storefront pages)
│   │   │   ├── layout.tsx                   # Root HTML layout with providers & fonts
│   │   │   ├── page.tsx                     # Store homepage (Hero, Featured, Reviews)
│   │   │   ├── globals.css                  # Global Tailwind CSS styles
│   │   │   ├── robots.ts                    # Dynamic robots.txt
│   │   │   ├── sitemap.ts                   # Dynamic sitemap.xml
│   │   │   ├── cart/page.tsx                # Shopping bag & checkout summary
│   │   │   ├── checkout/page.tsx            # Checkout & payment processing
│   │   │   ├── search/page.tsx              # Product search & filtering
│   │   │   ├── wishlist/page.tsx            # Saved items & wishlist
│   │   │   ├── collections/[handle]/        # Dynamic collection listing page
│   │   │   ├── products/[handle]/           # Product Details Page (PDP)
│   │   │   └── pages/[handle]/              # CMS pages (About, Privacy, Shipping, etc.)
│   │   │
│   │   ├── account/                         # Customer Account Area
│   │   │   ├── layout.tsx                   # Account navigation layout
│   │   │   ├── page.tsx                     # Account redirect router
│   │   │   ├── profile/page.tsx             # User profile & credentials
│   │   │   ├── orders/page.tsx              # Order history & tracking
│   │   │   ├── addresses/page.tsx           # Shipping & billing address manager
│   │   │   ├── wishlist/page.tsx            # Account wishlist
│   │   │   ├── login/page.tsx               # Customer login page
│   │   │   └── register/page.tsx            # Customer registration page
│   │   │
│   │   ├── admin/                           # Super Admin Control Center
│   │   │   ├── layout.tsx                   # Admin sidebar & header layout (RBAC protected)
│   │   │   ├── page.tsx                     # Main platform dashboard & analytics
│   │   │   ├── login/page.tsx               # Admin login portal
│   │   │   ├── (dashboard)/
│   │   │   │   ├── categories/page.tsx      # Category management
│   │   │   │   ├── content/page.tsx         # Storefront theme, header, footer & SEO settings
│   │   │   │   ├── coupons/page.tsx         # Discount & promo code manager
│   │   │   │   ├── customers/page.tsx       # Customer records
│   │   │   │   ├── inventory/page.tsx       # Low-stock SKU monitor
│   │   │   │   ├── reviews/page.tsx         # Customer review moderation
│   │   │   │   └── vendors/page.tsx         # Multi-vendor onboarding & status control
│   │   │   ├── collections/                 # Collection creation & product assignment
│   │   │   ├── orders/                      # Platform orders & fulfillment status
│   │   │   ├── pages/                       # CMS page editor
│   │   │   └── products/                    # Product catalog & vendor approval queue
│   │   │
│   │   ├── vendor/                          # Multi-Vendor Portal
│   │   │   ├── layout.tsx                   # Vendor portal shell & navigation
│   │   │   ├── page.tsx                     # Vendor overview dashboard
│   │   │   ├── login/page.tsx               # Vendor portal login
│   │   │   ├── (dashboard)/
│   │   │   │   ├── orders/page.tsx          # Vendor-specific order items
│   │   │   │   └── sales/page.tsx           # Revenue & units sold analytics
│   │   │   └── products/                    # Vendor product submission & management
│   │   │
│   │   └── api/                             # RESTful Next.js API Routes
│   │       ├── account/                     # Address & profile endpoints
│   │       ├── admin/                       # Admin CRUD & moderation endpoints
│   │       ├── auth/                        # NextAuth handler, register & password reset
│   │       ├── cart/                        # Cart synchronization, line items & coupons
│   │       ├── categories/                  # Public categories
│   │       ├── collections/                 # Public collections
│   │       ├── coupons/                     # Coupon code validation
│   │       ├── orders/                      # Order placement & cancellation
│   │       ├── pages/                       # CMS page retrieval
│   │       ├── payments/                    # COD, Razorpay, and Stripe payment routes
│   │       ├── products/                    # Product catalog, reviews, and search facets
│   │       ├── upload/                      # Blob image upload endpoint
│   │       ├── vendor/                      # Vendor product & dashboard endpoints
│   │       ├── webhooks/                    # Payment gateway webhooks
│   │       └── wishlist/                    # Wishlist persistence
│   │
│   ├── components/                          # React UI Components
│   │   ├── account/                         # Account profile, order list & address forms
│   │   ├── admin/                           # Admin forms, sidebar, editors & tables
│   │   ├── analytics/                       # Google Analytics & script trackers
│   │   ├── auth/                            # Login forms & sign-out buttons
│   │   ├── cart/                            # Slide-over cart drawer & line items
│   │   ├── checkout/                        # Multi-step checkout & payment form
│   │   ├── collection/                      # Filters, sort toolbar, infinite scroll list
│   │   ├── home/                            # Hero banner, featured categories, review rows
│   │   ├── layout/                          # Site header, mega menu, announcement bar, footer
│   │   ├── product/                         # Product gallery, variant selector, purchase panel, reviews
│   │   ├── providers/                       # Cart synchronization provider
│   │   ├── search/                          # Search dialog & live result grid
│   │   ├── shared/                          # Price display, star ratings, animation wrappers
│   │   ├── ui/                              # Primitive UI components (buttons, dialogs, sheets, inputs)
│   │   ├── vendor/                          # Vendor sidebar & submit buttons
│   │   └── wishlist/                        # Wishlist grid & item cards
│   │
│   ├── config/                              # Global site configuration & metadata
│   │   └── site.ts
│   │
│   ├── data/                                # Fallback static collections, products & reviews
│   │   ├── collections.ts
│   │   ├── navigation.ts
│   │   ├── products.ts
│   │   └── reviews.ts
│   │
│   ├── hooks/                               # Custom React Hooks
│   │   ├── use-collection-filters.ts        # URL query parameter filter state
│   │   ├── use-hydrated.ts                  # Client-side hydration helper
│   │   ├── use-infinite-products.ts         # Infinite scroll pagination
│   │   ├── use-recently-viewed.ts           # Local storage browsing history
│   │   └── use-search.ts                    # Debounced search query handler
│   │
│   ├── lib/                                 # Utilities & Integration Helpers
│   │   ├── admin-fetch.ts                   # Admin API client with error handling
│   │   ├── api-client.ts                    # Frontend API client
│   │   ├── auth-utils.ts                    # RBAC helper functions (requireSuperAdmin, requireVendor)
│   │   ├── blob-storage.ts                  # Vercel Blob file upload helper
│   │   ├── build-navigation.ts              # Mega menu data constructor
│   │   ├── catalog-images.ts                # Image resolution utilities
│   │   ├── constants.ts                     # Application constants
│   │   ├── payments.ts                      # Payment gateway configurations
│   │   ├── product-list-params.ts           # Query parser for catalog filtering
│   │   ├── rate-limit.ts                    # In-memory API rate limiter
│   │   ├── razorpay.ts                      # Razorpay SDK initialization
│   │   ├── seo.ts                           # Metadata builder
│   │   ├── site-seo.ts                      # SEO configuration loader
│   │   ├── size-chart-defaults.ts           # Default sizing guides
│   │   ├── store-theme-defaults.ts          # Default theme settings
│   │   ├── store-theme-schemas.ts           # Zod validation schemas for theme
│   │   ├── structured-data.ts               # JSON-LD Schema.org generators
│   │   ├── trust-icons.ts                   # Trust badges & footer icons
│   │   └── utils.ts                         # Class merging (cn) & currency formatting
│   │
│   ├── middleware.ts                        # Route protection & role-based access control
│   ├── providers/                           # React Query & Session context providers
│   │   ├── app-providers.tsx
│   │   └── session-provider.tsx
│   │
│   ├── server/                              # Server-Side Business Logic & Data Layer
│   │   ├── db/                              # Prisma client & fallback data store
│   │   │   ├── prisma.ts
│   │   │   └── mock-db.ts
│   │   ├── errors/                          # Custom AppError classes
│   │   │   └── app-error.ts
│   │   ├── mappers/                         # Data transfer mappers
│   │   │   ├── product.mapper.ts
│   │   │   └── review.mapper.ts
│   │   ├── repositories/                    # Database queries
│   │   │   └── product.repository.ts
│   │   ├── services/                        # Core service business logic
│   │   │   ├── account.service.ts
│   │   │   ├── admin-collection.service.ts
│   │   │   ├── admin-coupon.service.ts
│   │   │   ├── admin-inventory.service.ts
│   │   │   ├── admin-order.service.ts
│   │   │   ├── admin-page.service.ts
│   │   │   ├── admin-product.service.ts
│   │   │   ├── admin-review.service.ts
│   │   │   ├── admin-vendor.service.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── coupon.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── order.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── product.service.ts
│   │   │   ├── review.service.ts
│   │   │   ├── store-theme.service.ts
│   │   │   ├── storefront.service.ts
│   │   │   └── vendor-product.service.ts
│   │   └── validation/                      # Server-side Zod validation schemas
│   │       └── admin-product.schema.ts
│   │
│   ├── stores/                              # Zustand State Management
│   │   ├── auth-store.ts                    # Client auth state
│   │   ├── cart-store.ts                    # Local & server cart state
│   │   ├── search-store.ts                  # Search dialog modal state
│   │   └── wishlist-store.ts                # Saved items state
│   │
│   ├── types/                               # TypeScript Type Definitions
│   │   ├── cart.ts
│   │   ├── collection.ts
│   │   ├── next-auth.d.ts
│   │   ├── product.ts
│   │   ├── review.ts
│   │   ├── store-theme.ts
│   │   └── user.ts
│   │
│   └── utils/                               # Helper utility functions
│       └── slug.ts
│
├── .env.example                             # Environment variable template
├── components.json                          # shadcn/ui configuration
├── next.config.ts                           # Next.js configuration (images, output)
├── package.json                             # Dependencies & npm scripts
├── postcss.config.mjs                       # Tailwind PostCSS configuration
├── tailwind.config.ts                       # Tailwind styling configuration
└── tsconfig.json                            # TypeScript compiler settings
```
