# ArchNG

ArchNG is a verified architecture marketplace for Nigeria. The repository contains the Express/Prisma API, the shared Zod contract package, and the integrated React/Vite client.

## Repository layout

```text
backend/             Express 5 API (@archng/api)
  prisma/            schema, migrations and seed
  src/               routes, controllers, services, serializers
  tests/             Vitest + Supertest integration tests
apps/web/            React client (@archng/web)
packages/shared/     TypeScript Zod schemas and enums (@archng/shared)
```

## Requirements

- Node.js 20.19+ and npm 10+
- PostgreSQL 16+ (local service or Docker)
- Optional: Docker for `docker compose up -d`

## Quick start

```bash
npm install
Copy-Item backend/.env.example backend/.env
# Edit DATABASE_URL and JWT secrets in backend/.env
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

The API runs at `http://localhost:4000`; the web app runs at `http://localhost:5173`; Swagger UI is at `http://localhost:4000/api/docs`.

If you use a native PostgreSQL install instead of Docker, create `archng` and `archng_test` databases and point `DATABASE_URL` / `TEST_DATABASE_URL` at them.

## Seed accounts

All seed accounts use `Password123!`.

| Role | Email |
| --- | --- |
| Admin | `admin@archng.test` |
| Client | `client@archng.test` |
| Provider | `adaeze@archng.test` |

The seed mirrors the current UI: six verified practices, four monographs, four client requests, four leads for Adaeze Okafor Studio, verification cases, specialties, favorites and plate metadata.

Seeded verification document links under `/uploads/seed/...` are placeholders and do not resolve to files.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Watch shared package, run the API and start the web client |
| `npm run build` | Build shared types, syntax-check the API and build the web client |
| `npm run lint` | Lint shared, backend and web source |
| `npm test` | Run shared schema tests, reset `archng_test`, migrate and run API tests |
| `npm run db:migrate` | Create/apply a development migration |
| `npm run db:seed` | Seed the development database |
| `npm run db:reset` | Destructive reset followed by seed prompt |
| `npm run db:studio` | Open Prisma Studio |

## API overview

- `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout`; `GET /auth/me`
- `GET /api/v1/providers`, `/providers/:slug`, `/providers/:slug/gated`
- `GET /api/v1/projects`, `/projects/:idOrSlug`
- `GET /api/v1/specialties`
- `POST /api/v1/demo-requests`
- Client: `/api/v1/me/demo-requests`, `/me/favorites`
- Provider: `/api/v1/me/provider-profile`, `/me/demo-video`, `/me/provider/stats`, `/me/projects`, `/me/leads`
- Admin: `/api/v1/admin/stats`, `/admin/verifications`, `/admin/providers`, `/admin/users`, `/admin/projects`, `/admin/specialties`, `/admin/activity`
- Uploads: `POST /api/v1/uploads/sign` (provider/admin); local upload `PUT /api/v1/uploads/local/:token`

Access tokens are returned in the response body. Refresh tokens live in an httpOnly cookie scoped to `/api/v1/auth` and rotate on every refresh.

## Tests

`npm test` runs the shared Zod contract tests, resets the test database, applies migrations, and runs Supertest flows for discovery, auth rotation, request gating, provider project CRUD, demo video validation, favorites, uploads and admin actions.

Tests read `backend/.env.test`. Copy `backend/.env.test.example` and point `TEST_DATABASE_URL` at your test database. `TEST_DATABASE_URL` must contain `test`; the reset script refuses to run otherwise.

## Frontend

`apps/web/` is the integrated React client (`@archng/web`). It uses the API client in `apps/web/src/lib/api.ts`, API-backed context state, real auth and route guards. Copy `apps/web/.env.example` to `.env` only when overriding the default local API/asset URLs.

Frontend integration smoke tests can use the seed accounts above. Public provider data follows backend visibility rules; contact details, videos and registration numbers unlock for admins, owners, or clients with accepted/completed requests.
