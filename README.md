# OPTICANA — Store-First Delivery

## What changed

OPTICANA is now intentionally **one website**.

- The separate `OPTICANA-ADMIN` frontend has been removed.
- The customer storefront remains the main experience and its visual design is preserved.
- Product management is embedded at the same origin under `/manage`.
- Staff do not need a second website: open the same OPTICANA URL and use the private management path.
- Product management is deliberately small: add, edit, publish/unpublish, archive, image upload, pricing, stock, category, and basic product flags.
- The existing authenticated PostgreSQL/Prisma service is retained because shared products, stock, orders, reviews, and media cannot safely live in browser LocalStorage.
- Product images can be uploaded directly from the new manager; the existing service persists image data.
- Arabic/English switching was hardened with additional UI translations and dynamic-message rules.
- A product sharing action was added to product details without changing the store's visual language.
- Store-facing references to the old "Admin dashboard" wording were replaced with the new "Store Management" concept.

## Why a backend is still necessary

A browser-only product list would only live on one device unless a shared database or hosted data service were introduced. The existing backend is therefore kept as the smallest safe persistence layer for the current architecture.

The public storefront remains the only customer-facing website. The backend is an implementation detail.

## Manager flow

1. Visit `/manage` on the same OPTICANA domain.
2. Sign in with an `ADMIN` or `SUPER_ADMIN` account.
3. Add a product.
4. Upload its image.
5. Choose **Publish Product**.
6. The product becomes available to the public storefront through the existing public product API.

No separate admin frontend is required.

## Verification

- Relative import audit: run against the final source tree.
- JavaScript syntax audit: run with Node.
- Production build should be run in the deployment environment with a fresh `npm ci`, because the supplied archive's Linux-native Rolldown optional binding is not portable between operating systems.
- No `node_modules` is shipped in the final delivery.

## Required environment

Store frontend:

- `VITE_API_BASE_URL` — backend API base, normally `/api` when reverse-proxied on the same domain.
- `VITE_DEV_API_TARGET` — local development backend target.

Backend:

- PostgreSQL / Prisma configuration from the backend `.env.example`.
- Media storage configuration from the backend `.env.example`.

## Security

The `/manage` interface is not a secret URL. Its write operations are protected by the existing backend authentication and role checks. Only `ADMIN` and `SUPER_ADMIN` can create/update/archive products.

Never put database credentials or privileged API secrets in the Vite frontend.
