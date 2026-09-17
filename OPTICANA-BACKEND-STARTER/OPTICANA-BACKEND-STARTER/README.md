# OPTICANA Backend

Node.js + Express + PostgreSQL + Prisma backend for the OPTICANA Store and Admin applications.

## Architecture

```text
PostgreSQL
   ↓
Prisma
   ↓
OPTICANA API / Business Engine
   ├── Admin management API
   └── Public Store API
```

The database is the source of truth. Product prices, stock, orders, purchases, payments, customer/supplier balances, repairs, expenses, reviews, settings, and store content are server-side data. Browser state is limited to UI/session state plus Store cart/favorites/search preferences.

## Local setup

1. Create a PostgreSQL database.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN`.
3. Install dependencies:

```bash
npm ci
```

4. Validate/generate Prisma:

```bash
npm run prisma:validate
npm run prisma:generate
```

5. Apply migrations:

```bash
npx prisma migrate deploy
```

6. Create the first admin/configuration seed. Do not put production credentials in source control:

```bash
ADMIN_EMAIL="admin@example.com" \
ADMIN_PASSWORD="a-long-random-password" \
ADMIN_NAME="OPTICANA Admin" \
npm run prisma:seed
```

The seed intentionally does not invent products, customers, sales, purchases, or inventory.

7. Start the API:

```bash
npm run dev
```

Health check: `GET /api/health`

## Production

Set `NODE_ENV=production`, a strong random `JWT_SECRET`, the production PostgreSQL URL, and exact Store/Admin origins in `CORS_ORIGIN`. Put the `uploads/` directory on persistent storage (or replace the file-storage adapter with object storage later) because database rows store media URLs, not image bytes.

For production migrations use `prisma migrate deploy`, not `prisma migrate dev`.
