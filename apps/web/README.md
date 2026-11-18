# ArchNG Web

React 19, TypeScript, Vite, Tailwind CSS v4, and React Router v7 client for the ArchNG API.

## Getting started

From the repository root:

```bash
npm install
npm run dev
```

The web app runs at `http://localhost:5173`; the API runs at `http://localhost:4000`.

Copy `.env.example` to `.env` only if you need to point the client at a different API or asset host.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev -w @archng/web` | Start the Vite dev server |
| `npm run build -w @archng/web` | Type-check with `tsc -b` and build for production |
| `npm run preview -w @archng/web` | Preview the production build |
| `npm run lint -w @archng/web` | Run Oxlint |

## Demo access

All seed accounts use `Password123!`.

| Role | Email | Destination |
| --- | --- | --- |
| Client | `client@archng.test` | `/requests` |
| Architect | `adaeze@archng.test` | `/provider` |
| Admin | `admin@archng.test` | `/admin` |

Sign-in returns an access token kept in memory. The refresh token is an httpOnly cookie scoped to `/api/v1/auth`.

## Data flow

- `src/lib/api.ts` owns fetch, token refresh, DTO mappers, uploads and asset URL resolution.
- `src/context/AppContext.tsx` owns session, catalog, requests, favorites, leads, provider/admin data and toasts.
- Public provider and project data follows backend visibility and gating rules; accepted/completed requests unlock contact details and demo videos.
- The API base defaults to `http://localhost:4000/api/v1`; assets default to `http://localhost:4000`.

## Project structure

```text
src/
  App.tsx                 # Route tree and providers
  main.tsx                # App entry point
  index.css               # Tailwind v4 theme tokens and global utilities
  data.ts                 # UI types and imagery
  components/
    ui.tsx                # Buttons, inputs, badges, dialog, toast, states
    cards.tsx             # Architect, project, request, and lead cards
    layout.tsx            # Public, provider, and admin shells
  context/
    context.ts            # Context types and useApp hook
    AppContext.tsx        # Session and API-backed account state
  features/               # Public, client, provider, admin and system screens
  lib/
    api.ts                # API client, DTOs and mappers
    cn.ts                 # Class combiner
    format.ts             # Naira, date, and initials formatting
```

## Design system

- Warm editorial palette defined as Tailwind v4 `@theme` tokens in `src/index.css`.
- Primary terracotta `#B8502D`; ink `#1C1B19`; warm surface `#FDF8F5`; verified green `#1F7A5A`.
- Newsreader for display type, Inter for body and UI, Material Symbols for icons (loaded in `index.html`).
- Light theme only.
- Shared primitives live in `src/components/ui.tsx`; layout shells and page headers live in `src/components/layout.tsx`.
