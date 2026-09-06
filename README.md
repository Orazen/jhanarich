# JHANARICH Web Platform (Next.js)

Premium cookware-manufacturer website + admin console, built from "Website details.docx"
and the official JHANARICH logo / WhatsApp product shots.

## Run

```bash
cd ~/jhanarich-web
npm run dev        # http://localhost:3000
```

First-time setup (already done): `npx prisma db push && npm run db:seed`

- **Website:** http://localhost:3000
- **Admin console:** http://localhost:3000/admin → login `admin` / `jhanarich2025`
  (dev defaults; **change before deploying** — override with `ADMIN_USER`, `ADMIN_PASSWORD`, `ADMIN_SECRET` env vars, see `.env.example`)

## Stack

- Next.js 14 (App Router) + React 18, plain CSS design system (no UI kit)
- Prisma + SQLite (`prisma/dev.db`) — `Product` & `Enquiry` models
- Lenis smooth scrolling; all motion is dependency-light custom JS/CSS
- Fonts: Fraunces / Instrument Sans / IBM Plex Mono via `next/font`

## Features

**Website**
- Awwwards-style editorial: Forged-for-fire hero (real pan cutout, logo medallion,
  steam, magnetic buttons), scroll-pinned triply exploded-layer scene with heat
  ripples and bond flash, kinetic marquee, glow-follow + 3D-tilt product cards
- Products render from the database; every card has an Enquire button that opens
  WhatsApp with a product-specific pre-filled message
- Enquiry form → saved to DB **and** opens WhatsApp with a pre-filled message
- Category filter tabs, counters, process timeline, OEM band, spec-sheet posters

**Admin console** (`/admin`)
- Overview: new/total enquiries, products live, catalogue composition bars, latest enquiries
- Enquiries: filter by status, status workflow (new → contacted → closed),
  WhatsApp one-click reply (when phone captured), delete
- Products: full CRUD — edit name/category/description/image inline, toggle live
  status & featured, reorder, add/delete products; site reflects changes instantly

**AI layer (research-grounded: catalog-RAG with templated fallbacks, human-in-the-loop)**
- **JHANA assistant** (floating chat, bottom-left): catalog-grounded Q&A — series tech, OEM, pricing process, address, shipping — with product cards attached to answers and one-tap WhatsApp handoff. Intent routing + keyword/retrieval matching runs fully offline; set `GEMINI_API_KEY` or `OPENAI_API_KEY` to upgrade phrasing quality automatically (same UX).
- **Admin → Enquiries**: ✦AI on any row classifies intent (oem/pricing/catalogue/horeca/partnership) + urgency, drafts a ready-to-send WhatsApp reply (editable, human-in-the-loop), or copies it if no phone. CSV export for the whole list.
- **Admin → Products**: ✦AI Write generates on-brand product descriptions (local template engine or LLM).
- **Safety**: outbound LLM calls are SSRF-hardened (https-only + host allowlist via `lib/urlguard.js`), chat is rate-limited (20/min/IP), enquiry input validated/clamped (`lib/validate.js`).
- **Tests**: `npm test` — 25 node:test cases covering validation, classification, chat routing, description generation, auth tokens and the URL guard.

## Run

```bash
cd ~/jhanarich-web
npm run dev        # http://localhost:3000
npm test           # 25 tests
```

Optional AI upgrade: `GEMINI_API_KEY=… npm run dev` (or `OPENAI_API_KEY=…`). Without a key everything still works on the local engine.

## Deploy

- **Hostinger VPS (recommended — persistent SQLite, no external DB):** see [DEPLOY.md](./DEPLOY.md) — one script sets up Node, nginx, PM2, DB and HTTPS.
- **Serverless (Vercel):** needs a hosted DB (Turso) — see commit `ae2a55b` notes; SQLite does not persist on serverless filesystems.

## Legacy

The original static one-page build is archived at `~/jhanarich-site`
(served on :8940 while its `python3 -m http.server` runs).
