# ArchNG

A frontend prototype for the **Nigerian Architectural Registry & Commissioning Monograph** — a verified directory of ARCON-registered practices, a commissioning workflow for clients, a practice workspace for architects, and a registrar console for the council.

Built with React 19, TypeScript, Vite, Tailwind CSS v4, and React Router v7. This is a client-side prototype: all data is mocked and persisted to `localStorage` — there is no backend.

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check with `tsc -b` and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |

## Demo access

Authentication is simulated. Use any valid-looking email and a password of 8+ characters. Choose an access role on the sign-in screen:

| Role | Destination |
| --- | --- |
| Client | `/requests` |
| Architect | `/provider` |
| Council | `/admin` |

The seed data includes an accepted request (`r1`) for Adaeze Okafor Studio, so signing in as a client unlocks that practice's full monograph and request detail.

State is stored under these `localStorage` keys:

- `archng.role`
- `archng.signedIn`
- `archng.requests`
- `archng.saved`

Clear site data to reset the prototype to its seed state.

## Routes

### Public

| Route | Screen |
| --- | --- |
| `/` | Discover — hero, search, curated studios, featured monograph, how it works |
| `/architects` | Directory — search and filters (`q`, `state`, `typology` sync to the URL) |
| `/architects/:slug` | Architect monograph, locked until a client has an accepted request |
| `/architects/:slug/accepted` | Architect monograph with the accepted-request view unlocked |
| `/saved` | Saved practices (device-local reading list) |
| `/projects/:slug` | Project monograph — specs, gallery, plate index |
| `/request-demo/:slug` | Commission request form with validation and success state |
| `/requests` | Client request list |
| `/requests/:id` | Request detail — status timeline and unlock state |
| `/system-states` | Fallback states — directory empty, requests empty, loading skeletons, upload failure, and 404 |
| `*` | Not found |

### Auth

| Route | Screen |
| --- | --- |
| `/signin` | Sign in |
| `/register` | Create account |

### Architect workspace

| Route | Screen |
| --- | --- |
| `/provider` | Practice dashboard — stats, activity, recent requests |
| `/provider/profile` | Profile editor with simulated document upload |
| `/provider/projects/:id/edit` | Project editor |
| `/provider/leads` | Leads inbox with accept/decline actions |

### Council console

| Route | Screen |
| --- | --- |
| `/admin` | Registrar dashboard |
| `/admin/verification` | Verification queue, dossier dialog, Form B preview, approve/reject |

## Project structure

```text
src/
├── App.tsx                 # Route tree and providers
├── main.tsx                # App entry point
├── index.css               # Tailwind v4 theme tokens and global utilities
├── data.ts                 # Types, imagery, and all seed data
├── components/
│   ├── ui.tsx              # Buttons, inputs, badges, dialog, toast, states
│   ├── cards.tsx           # Architect, project, request, and lead cards
│   └── layout.tsx          # Public, provider, and admin shells
├── context/
│   ├── context.ts          # Context types and useApp hook
│   └── AppContext.tsx      # Provider, persisted state, and actions
├── features/
│   ├── Discover.tsx
│   ├── Directory.tsx
│   ├── ArchitectProfile.tsx
│   ├── ProjectDetail.tsx
│   ├── Auth.tsx
│   ├── RequestDemo.tsx
│   ├── Requests.tsx
│   ├── Provider.tsx
│   ├── Admin.tsx
│   └── SystemStates.tsx
└── lib/
    ├── cn.ts               # Class combiner
    └── format.ts           # Naira, date, and initials formatting
```

## Design system

- Warm editorial palette defined as Tailwind v4 `@theme` tokens in `src/index.css`.
- Primary terracotta `#B8502D`; ink `#1C1B19`; warm surface `#FDF8F5`; verified green `#1F7A5A`.
- Newsreader for display type, Inter for body and UI, Material Symbols for icons (loaded in `index.html`).
- Light theme only.
- Shared primitives live in `src/components/ui.tsx`; layout shells and page headers live in `src/components/layout.tsx`.

## Reference material

- `docs/archng_unified_design.md_specification.md` — the 16-screen specification.
- `docs/DESIGN.md` — design notes and tokens.
- `docs/ArchNg Design screens/` — desktop and mobile visual references.
