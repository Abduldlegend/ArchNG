# DESIGN.md — ArchNG Platform Design System & Screen Specifications

Comprehensive design specification and UI guidelines synthesized across all 32 canonical desktop and mobile screens of the ArchNG platform (*Nigerian Architectural Registry & Commissioning Monograph*).

---

## 1. Visual Philosophy & Brand Identity

- **Brand Archetype:** Authoritative, scholarly, tactile, institutional. ArchNG operates at the intersection of prestigious architectural monographs and statutory regulatory compliance under the Architects Registration Council of Nigeria (ARCON Act CAP A19 LFN 2004).
- **Core Aesthetic:** *Warm Editorial Architecture* — reminiscent of archival heavy-stock art paper, warm sunlit terracotta, and crisp drafting typography.
- **Theme Standard:** Strict Light Theme. No harsh stark whites or artificial pure dark modes across public surfaces; dark accents are reserved for ink-toned drafting badges and inspection media.

---

## 2. Color System & Semantic Tokens

| Token Name | Value | Role & Usage |
| :--- | :--- | :--- |
| `surface` | `#FDF8F5` / `#F7F4EE` | Canvas root & page backdrop (*Warm Paper / Heavy Ivory Stock*) |
| `surface-low` | `#F7F3EF` / `#EFEAE0` | Alternate neutral containers, filter sidebars, table headers |
| `surface-container` | `#FFFFFF` | Primary cards, modal dialogue panels, elevated sheets |
| `surface-dim` | `#DDD9D6` | Inactive backgrounds, skeleton loading shimmer bases |
| `surface-tint-terracotta` | `#FAECE7` | Soft terracotta pill badge background, active row highlights |
| `primary` | `#B8502D` | Terracotta / Rust accent — Primary CTAs, active indicators, status badges |
| `primary-hover` | `#9F4324` | Hover and active pressed states for primary action triggers |
| `on-surface` | `#1C1917` | Ink Black — high-contrast headlines and primary body text |
| `on-surface-variant` | `#57534E` | Warm stone charcoal — metadata, secondary subtitles, timestamps |
| `outline` | `#E7E2DA` | Hairline borders on cards, table rows, and structural dividers |
| `outline-variant` | `#D6CEBF` | Interactive input borders, card borders, tab line dividers |
| `success` | `#2E7D32` | ARCON Verified Seal, Accepted status pill, Approval toasts |
| `warning` | `#D97706` | In-Review status badges, pending Form B compliance alerts |
| `error` | `#C5221F` | Form validation alerts, declined commissions, statutory rejection notices |

---

## 3. Typography Scale & Font Pairings

- **Display & Monograph Headlines:** `Newsreader` / `Fraunces` (Editorial Serif)
  - Characterized by high editorial elegance, subtle warmth, and generous optical spacing.
  - Applied to screen titles, firm names, monograph case studies, and editorial pull quotes.
- **Interface & Operational Controls:** `Inter` / System Sans-Serif
  - Crisp, neutral, highly legible at micro-scales.
  - Applied to form fields, data tables, ARCON license IDs, status badges, and navigation links.

### Type Scale Breakdown
- **Display Lg:** `2.75rem` (44px) / Line-height `1.15` / `Newsreader` (Hero headings, Monograph names)
- **Headline Lg:** `2.0rem` (32px) / Line-height `1.25` / `Newsreader` (Section titles, Editor headings)
- **Headline Md:** `1.5rem` (24px) / Line-height `1.35` / `Newsreader` (Card titles, Drawer headers)
- **Title Md:** `1.125rem` (18px) / Line-height `1.4` / `Inter Medium` (Subsections, Modal titles)
- **Body Md:** `1.0rem` (16px) / Line-height `1.5` / `Inter Regular` (Paragraphs, project descriptions)
- **Body Sm:** `0.875rem` (14px) / Line-height `1.45` / `Inter Regular` (Metadata, specifications, tables)
- **Label / Caps:** `0.75rem` (12px) / Tracking `0.05em` / Uppercase `Inter Medium` (Category tags, ARCON codes)

---

## 4. Layout, Grid & Spatial Conventions

- **Base Spacing Rhythm:** 4px baseline, 8px layout grid (8px, 16px, 24px, 32px, 48px, 64px).
- **Corner Radii:**
  - `rounded-lg` (8px): Cards, inputs, buttons, media previews, modal panels.
  - `rounded-full` (9999px): Status pills, filter chips, author avatars, verification badges.
- **Elevation & Depth:**
  - Flat architectural elevation: rely on crisp 1px borders (`#E7E2DA` / `#D6CEBF`) rather than diffuse shadows.
  - Floating navigation: Subtle border with backdrop blur (`backdrop-blur-md bg-[#FDF8F5]/90`).
- **Touch & Accessibility:**
  - Minimum 44px tap target height across all mobile buttons, tabs, and actionable table rows.
  - Visible terracotta focus outline (`outline: 2px solid #B8502D; outline-offset: 2px`).

---

## 5. Global Component Library

### 5.1 Headers & Navigation
- **Desktop Public Header:**
  - Left: Brand mark `ArchNG` + statutory `REG. NG` badge.
  - Center: Main navigation links (*Architects*, *Projects*, *How it works*).
  - Right: Quick Search input, "Sign in" text link, and Terracotta CTA button "Join as an architect".
- **Mobile Public Header:**
  - Compact 56px sticky bar with hamburger menu trigger, centered `ArchNG` logo with ARCON mark, and "Join as architect" button.
- **Mobile Bottom Navigation Dock:**
  - Fixed 64px height bottom dock with 4 destinations: *Discover*, *Directory*, *Saved*, *Inquiries* (with active notification dot).

### 5.2 Provider & Admin App Shells
- **Persistent Workspace Sidebar (Desktop):**
  - Practice header with firm seal, ARCON license number, and chapter badge.
  - Nav items: *Dashboard*, *Profile*, *Projects*, *Demo video*, *Leads & Inquiries*, *Verification*.
  - Footer utilities: *ARCON Registry Support*, *Practice Guidelines*, *Sign out*.
- **Admin Governance Console Shell:**
  - Top territorial bar displaying active state chapters (*Lagos, Abuja FCT, Port Harcourt, Ibadan, Enugu*).
  - ARCON Registrar profile badge and quick dossier search.

### 5.3 Cards & Monograph Plates
- **Architect Directory Card:**
  - Hero preview image of recent built work with "Video Demo Available" overlay badge.
  - Firm name, location node, years of practice, built works count, and average commission scale.
  - Specialty chips (*Rammed Earth*, *Tropical Modernism*, *Coastal Residential*).
  - Dual action triggers: "Monograph" (secondary) and "Request Demo" (primary terracotta).
- **Project Monograph Plate Card:**
  - Archival plate numbering (*Plate 01 of 08*), year of completion, and contract scale.
  - Technical specs: Typology, GFA (m²), structural system, and climate strategy.

### 5.4 Form Controls & Regulatory Review Drawers
- **Input Fields:** Warm paper or white backgrounds, subtle border, floating labels, explicit validation error message blocks.
- **Form B Inspection Drawer (ARCON Council):**
  - Split inspection layout: Registrant metadata on top, PDF statutory certificate viewer below.
  - Dual statutory buttons: "Approve & Verify" (success green) vs "Reject Filing" (error red with mandatory reason field).

### 5.5 Global Statutory Footer
- 4-column statutory directory layout:
  1. *Brand Statement & Archival Notice*
  2. *Regional Registry Hubs (Lagos, Abuja Central, Port Harcourt, Ibadan, Enugu)*
  3. *Practice Standards & Statutory Guidelines (ARCON CAP A19 LFN 2004)*
  4. *Institutional & Client Safeguards (Escrow protections under Decree No. 10 of 1969)*

---

## 6. Comprehensive Screen Directory (Synthesized Suite)

### S01 · Discovery & Home
- **Desktop:** `SCREEN_39` | **Mobile:** `SCREEN_40`
- **Role:** Sovereign territorial discovery portal.
- **Specs:** Stat counter (280+ Verified Studios, ₦42.8B Monitored Capital, 7 Major Cities), search card with state tag shortcuts, curated practices of distinction, and "How ArchNG Works" 3-step protocol.

### S02 · Verified Architect Directory
- **Desktop:** `SCREEN_38` | **Mobile:** `SCREEN_37`
- **Role:** Credentialed practice catalog with faceted filtering.
- **Specs:** Sticky faceted filter panel (ARCON license status, State/District, Typology, Fee tier, Experience years), responsive card grid, and mobile bottom-sheet filter modal.

### S03 · Architect Profile (Public / Locked View)
- **Desktop:** `SCREEN_36` | **Mobile:** `SCREEN_35`
- **Role:** Public monograph showcase for Adaeze Okafor Studio.
- **Specs:** ARCON credentials (#3812), philosophy essay, locked video walkthrough preview, sticky consultation card with "Request a demo" and "Save architect".

### S04 · Architect Profile (Accepted Client / Unlocked View)
- **Desktop:** `SCREEN_34` | **Mobile:** `SCREEN_33`
- **Role:** Unlocked monograph accessible after commission inquiry approval.
- **Specs:** Green "Accepted Client" status banner, unlocked 21-minute technical video demo, direct studio contact desk (Email, Studio line, Direct mobile, WhatsApp channel CTA), and high-res CAD plates.

### S05 · Project Detail: The Epe Courtyard Villa
- **Desktop:** `SCREEN_32` | **Mobile:** `SCREEN_31`
- **Role:** In-depth architectural case study and construction monograph.
- **Specs:** Monograph plate gallery with carousel controls, authenticated audit data (₦450M construction scale, 620 m² GFA), passive bioclimatic cooling breakdown, and "More from this architect" project reel.

### S06 · Sign in & Register
- **Desktop:** `SCREEN_30` | **Mobile:** `SCREEN_29`
- **Role:** Split-screen authentication for clients, architects, and council admins.
- **Specs:** Tabbed switcher ("Sign in" vs "Create account"), ARCON practitioner folio authentication option, inline error state display, and institutional compliance notices.

### S07 · Request a Demo / Consultation
- **Desktop:** `SCREEN_28` | **Mobile:** `SCREEN_27`
- **Role:** Commission specification submission form.
- **Specs:** Selected firm recap card, project typology dropdown, Nigerian state & corridor picker, escrow-verified budget selector (₦5m–₦20m, ₦20m+), and character-counted brief field.

### S08 · My Requests (Client Portal)
- **Desktop:** `SCREEN_26` | **Mobile:** `SCREEN_25`
- **Role:** Client tracking dashboard for outgoing consultation requests.
- **Specs:** Status filter tabs (All, Requested, Accepted, Completed, Declined, Cancelled), structured inquiry cards with project scope, fee brackets, and direct link to unlocked dossiers.

### S09 · Request Detail (Accepted Status)
- **Desktop:** `SCREEN_24` | **Mobile:** `SCREEN_23`
- **Role:** Dedicated milestone tracker for an accepted client brief.
- **Specs:** 3-step progress stepper (Requested → Accepted → Completed), unlocked video player, personalized note from studio principal, and direct communication triggers (WhatsApp / Schedule Call).

### S10 · Provider Dashboard (Architect App Shell)
- **Desktop:** `SCREEN_22` | **Mobile:** `SCREEN_21`
- **Role:** Architect practice management overview.
- **Specs:** App shell with persistent sidebar, pending verification banner, 3 KPI metric sparklines (Profile Views, Saves & Bookmarks, New Requests), profile completeness meter (75%), and active monograph exhibits.

### S11 · Profile Editor (Architect App Shell)
- **Desktop:** `SCREEN_20` | **Mobile:** `SCREEN_19`
- **Role:** Practice accreditation, bio, and contact management.
- **Specs:** Step-indexed form sections (Practice Basics, Contact Desk & Privacy, Typologies & Focus Areas, Work Milestones, Technical Demo Video Walkthrough link uploader).

### S12 · Project Editor (Architect App Shell)
- **Desktop:** `SCREEN_18` | **Mobile:** `SCREEN_17`
- **Role:** Monograph authoring and technical drawing uploader.
- **Specs:** Breadcrumb navigation, publication status toggle (Draft / Published / Hidden), drag-and-drop plate uploader with conversion progress bar, technical attributes form, and ARCON compliance checklist.

### S13 · Leads Inbox (Architect App Shell)
- **Desktop:** `SCREEN_16` | **Mobile:** `SCREEN_15`
- **Role:** Commission briefing triage inbox.
- **Specs:** Split view or card list of client submissions with 72-hour decision window countdown, attached cadastral surveys, and dual "Accept request" vs "Decline" controls.

### S14 · Admin Dashboard (ARCON Council Shell)
- **Desktop:** `SCREEN_14` | **Mobile:** `SCREEN_13`
- **Role:** Statutory council oversight dashboard.
- **Specs:** Federal statutory monitor, registry metrics (4,892 Users, 348 Verified ARCON, 1,284 Monographs, 92 Commissions), pending verification queue summary, and real-time council activity feed.

### S15 · Verification Queue (ARCON Council Shell)
- **Desktop:** `SCREEN_12` | **Mobile:** `SCREEN_11`
- **Role:** Statutory practitioner licensing and Form B verification queue.
- **Specs:** Data table of pending practitioner dossiers with SLA badges, interactive Form B annual practicing license preview drawer, and statutory action buttons ("Approve & Verify" vs "Reject").

### System States Suite (Empty, Loading, Error & 404)
- **Desktop:** `SCREEN_10` | **Mobile:** `SCREEN_8`
- **Role:** Complete fallback state coverage.
- **Specs:** 5 tab-switchable system views:
  1. *Directory No Results* (zero matches query with search reset CTA)
  2. *My Requests Empty* (guidance on discovering verified practices)
  3. *Loading Skeleton* (shimmering card skeletons)
  4. *Upload Failed & Retry* (network drop alert with retry CTA)
  5. *404 Not Found* (editorial 404 error with return home link)

---

## 7. Responsive Breakpoint Standards

- **Mobile Viewport (`320px – 639px`):**
  - Single-column flow, edge-to-edge cards with `px-4` padding.
  - Sticky top app bar + fixed 64px bottom navigation bar.
  - Filter dialogs rendered as slide-up bottom sheets.
  - Data tables re-rendered as stacked specification cards.
- **Tablet Viewport (`640px – 1023px`):**
  - 2-column card grids, top navigation with collapsible drawer menu.
  - Sidebars collapse to icon-only rail or horizontal sub-navigation.
- **Desktop Viewport (`1024px – 1440px+`):**
  - Full widescreen multi-column layouts (max width `1280px` / `7xl` centered).
  - Persistent 260px workspace sidebars on provider and admin app shells.
  - Dual-pane split screens for leads inbox and verification drawers.
