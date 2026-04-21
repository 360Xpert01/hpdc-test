# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Clerk (@clerk/react + @clerk/express)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### HPDC Certificate Verification Platform (`artifacts/hpdc-cert`)
- React + Vite web app at `/`
- Bilingual Arabic/English certificate verification platform
- Deep green (#1a5c38) + gold (#c5a028) HPDC brand colors
- **Pages:**
  - `/` — Public landing page (shows dashboard if signed in)
  - `/verify` — Certificate verification by ID or QR
  - `/registry` — Public registry of certified companies (search on button press)
  - `/about` — About HPDC, Mission, Vision, ESG scheme
  - `/certificate` — Certificate detail/print view
  - `/qr/:id` — QR code redirect → certificate page
  - `/sign-in` — Clerk-powered sign in (email + Google)
  - `/sign-up` — Account type selection (Company/Individual) + Clerk registration → redirects to /profile-setup
  - `/profile-setup` — Profile completion form (different fields for company vs individual) → redirects to /dashboard
  - `/dashboard` — Account-type-aware dashboard: Company portal (applications + certs) OR Individual portal (browse services)
  - `/apply` — Full-page accreditation application form (complementary to profile-setup data)
  - `/admin` — Admin dashboard (requires login + admin role)
- **User Registration Flow:** /sign-up → /profile-setup → /dashboard
- **Accreditation Flow:** /dashboard → /apply → track in /dashboard
- **Account Types:** "company" (منشأة/شركة) and "individual" (فرد) — each gets different dashboard experience

### API Server (`artifacts/api-server`)
- Express 5 backend with Clerk middleware
- **Routes:**
  - `GET /api/healthz` — health check
  - `GET /api/certificates` — list all (public)
  - `GET /api/certificates/:id` — get by certificateId (public, used by QR)
  - `POST /api/certificates` — create (admin only)
  - `GET /api/certificates/stats/summary` — stats
  - `GET /api/users/me` — current user profile (auth required)
  - `GET /api/users/me/certificates` — company's own certificates (auth required)
  - `POST /api/users/sync` — sync Clerk user to DB (called on login)
  - `GET /api/users` — list all users (admin only)
  - `PATCH /api/users/:userId/role` — update user role (admin only)

## Database Schema

### `certificates` table
- `certificate_id` — QR code uses `/?id=CERT-ID`
- `status` — "valid" | "expired" | "suspended"
- `company_name`, `site_name`, `location`
- `issue_date`, `expiry_date`
- `certification_body`, `scheme_owner` (default: "HPDC")
- `scope_statement`, `verification_message`
- `company_clerk_id` — links to a user's Clerk ID for company portal

### `users` table
- `clerk_id` — Clerk user ID
- `email`, `company_name`
- `role` — "admin" | "company" (default: "company")

## Auth Flow
- All users sign up/in via Clerk (email + password, or Google)
- On first login, frontend calls POST /api/users/sync to create user in local DB
- Role starts as "company" — admin promotes via /admin users panel
- Companies see their own certificates in /dashboard
- Admin sees all certificates and users in /admin

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
