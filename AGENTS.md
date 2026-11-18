# ArchNG Agent Notes

## Repository shape

- `backend/` — Express 5 API (`@archng/api`), Prisma/PostgreSQL, plain JavaScript ESM.
- `packages/shared/` — TypeScript Zod schemas, enums and constants compiled to `dist/`.
- `apps/web/` — React 19/Vite client (`@archng/web`), integrated with the API.
- `backend/docs/BACKEND_PLAN.md` — canonical backend contract and phase plan.

The original `BACKEND_PLAN.md` referenced a missing `AGENTS.md` Prisma draft. The schema below was reconstructed from the plan and the existing UI. Document any further deviation here before migrating.

## Commands

Run from the repository root unless noted.

```bash
npm install
npm run dev                 # shared watch + API :4000 + web :5173
npm run build               # shared tsc + backend syntax check + web production build
npm run lint                # shared + backend + web lint
npm test                    # shared schema tests + resets archng_test, migrates, runs Vitest/Supertest
npm run db:migrate          # prisma migrate dev
npm run db:seed             # seed development database
npm run db:reset            # destructive reset + seed prompt
npm run db:studio
```

`backend/.env` is required for local API and Prisma commands. Copy `backend/.env.example`; for a native PostgreSQL setup use your local credentials. The default compose file exposes PostgreSQL on `5432`.

Tests use `backend/.env.test` and `TEST_DATABASE_URL`. The test database URL must contain `test` because `npm test` runs `prisma migrate reset --force --skip-seed`.

## Data model decisions

- Ten domain models: `User`, `ProviderProfile`, `Experience`, `Project`, `ProjectImage`, `Specialty`, `DemoRequest`, `Favorite`, `VerificationDocument`, `RefreshToken`.
- `BudgetRange` is stored as the shared string enum (`5M_20M`, `50M_250M`, etc.) to keep API values aligned with the frontend.
- `ProviderProfile.worksCount` mirrors the curated “works” count shown in the UI; it is not derived from seeded projects.
- `ProjectImage` carries plate metadata (`plateLabel`, `plateTitle`, `plateYear`, `plateScale`) and photo/plate kind.
- A partial unique index enforces one active request per `(userId, providerId, projectType)` where status is `REQUESTED` or `ACCEPTED`.
- Public visibility requires an `ACTIVE` user, `published = true`, and `verificationStatus = VERIFIED`.

## Auth and access

- Access JWT is returned in the response body and intended to live in memory on the client.
- Refresh JWT is httpOnly, scoped to `/api/v1/auth`, rotated on every refresh, and stored hashed in `RefreshToken`.
- Public provider responses omit contact details, video URL/source, registration number and verification documents.
- Gated details unlock for admins, the owning provider, or a client with an `ACCEPTED`/`COMPLETED` request.
- Providers can only publish a profile or project after verification. Rejected verification unpublishes the profile.
- Suspending an account revokes refresh tokens and blocks authenticated access.

## API conventions

- Base path: `/api/v1`.
- Success: `{ "data": ... }`, optionally `{ "meta": ... }`.
- Errors: `{ "error": { "code", "message", "details?" } }`.
- Validation is Zod-based from `@archng/shared`; query results are available on `req.validatedQuery`.
- `GET /health` and `/api/v1/health` check database connectivity.
- Swagger UI: `/api/docs`; OpenAPI JSON: `/api/docs.json` in non-production.
- Upload flow: providers/admins call `POST /api/v1/uploads/sign`, then either local `PUT /api/v1/uploads/local/:token` or Cloudinary direct upload.
- Email driver defaults to console in development; storage driver defaults to local `backend/uploads`.
- `backend/docs/BACKEND_PLAN.md` predates the workspace move: it still names `apps/api` and an older `{ success, message, data }` envelope. The repository shape and the envelope rules above are authoritative.

## Conventions

- Keep backend code plain ESM JavaScript with JSDoc only where useful.
- Put reusable serializers in `backend/src/serializers/index.js`, Prisma include shapes in `backend/src/config/includes.js`.
- Add or change request/response shapes in `packages/shared` first, rebuild it, then consume from the API.
- Keep web networking and DTO mapping in `apps/web/src/lib/api.ts`; keep API-backed session/account state in `apps/web/src/context/AppContext.tsx`.
- Web env overrides are `VITE_API_BASE_URL` and `VITE_ASSET_BASE_URL`; copy `apps/web/.env.example` only when overriding local defaults.
- Run `npm run build`, `npm run lint`, and `npm test` before considering work complete.
- Commit after each completed feature with a focused message and passing checks.
