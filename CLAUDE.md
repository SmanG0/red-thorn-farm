# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

There is no build step for the frontend — HTML/CSS/JS files are served directly.

**Convex backend (run from the project root):**
```bash
npx convex dev        # start local Convex dev server + watch for schema/function changes
npx convex deploy     # deploy Convex functions and schema to production
```

**Local development:** Open `index.html` directly in a browser, or use a simple static server (e.g. `npx serve .`). The frontend hardcodes the production Convex URL (`https://prestigious-goldfish-965.convex.cloud`) — swap that constant to the local dev URL printed by `npx convex dev` when testing locally.

**Deployment:** Static files auto-deploy via Vercel on push (project `red-thorn-farm`, org `team_QJt7iTsGcfk3FzRRl8MSKjGj`).

## Architecture

### Frontend — plain HTML/CSS/JS, no framework, no bundler

Each page is a standalone `.html` file. Every page sets `window.RTPAGE = { id: '…', heroOverlay: true|false }` before loading scripts; `chrome.js` reads this to inject the shared nav and footer into `#nav-mount` / `#foot-mount` placeholders and to mark the active nav link.

- `styles.css` — design-system base (CSS custom properties, typography, layout primitives)
- `enhancements.css` — scroll-reveal and animation styles; only activate when `enhancements.js` adds `rt-enhanced` to `<body>`
- `enhancements.js` — progressive enhancement layer (scroll-reveal via IntersectionObserver, progress bar). Safe to remove per-page.
- `tweaks-panel.jsx` / `tweaks-app.jsx` — in-browser React prototype panel loaded via CDN Babel. Dev/design tool only; not used in admin or order flows.

**Design system tokens** (defined in `styles.css`): `--bg` (parchment), `--ink` (warm near-black), `--accent` (oxblood red), `--gold` (warm metallic), `--muted`, `--hair` (borders). Fonts: Cormorant Garamond (display headings) + Work Sans (body).

The design has two sets of switchable variants, controlled by attributes on `<html>` and toggled by the tweaks panel:
- **Palette** via `data-palette`: `parchment` (default), `forest`, `oxblood`, `bright`
- **Density** via `data-density`: `compact`, `regular` (default), `comfy`

Image assets live in two places:
- `assets/` — committed static images (logo, icons, SVGs)
- `uploads/` — gitignored runtime photos (production content images referenced in HTML)

### Backend — Convex (serverless DB + functions)

All backend logic lives in `convex/`. The `convex.json` project slug (`pilo`) is an older config artifact — the live production deployment URL is the one hardcoded in the frontend HTML (`https://prestigious-goldfish-965.convex.cloud`), not the URL in `convex.json`.

The schema defines three tables:

| Table | Purpose |
|---|---|
| `orders` | Customer orders; status flow: `pending → confirmed → delivered` (or `cancelled`) |
| `batches` | Production batch schedule; `publicNote` is customer-visible on the homepage calendar |
| `products` | Product catalogue with `inStock` flag; toggled from admin to show/hide same-day availability |

The frontend calls Convex directly via its REST API — no SDK on the page:
```js
fetch(CONVEX_URL + '/api/query',    { body: JSON.stringify({ path: 'batches:listUpcoming', args: {}, format: 'json' }) })
fetch(CONVEX_URL + '/api/mutation', { body: JSON.stringify({ path: 'orders:submitOrder',   args: {…}, format: 'json' }) })
```

### Order flow

1. Customer selects quantities from hardcoded product cards in `order.html`
2. A `submissionId` UUID is generated per page session (stored in `sessionStorage`) for idempotency
3. On submit: order is saved to Convex via `orders:submitOrder`, then a pre-filled WhatsApp message is opened to `+254 719 222 299`
4. `orders:submitOrder` is idempotent — same `submissionId` returns the existing order; it also soft-warns (but still allows) if the same phone number has a pending order for the same `deliveryWeek` (always next Friday). Order numbers follow the format `RT-YYYYMMDD-###` (daily sequence).

**Important:** The product list in `order.html` is hardcoded HTML. The `products` table in Convex is used only to mark items out-of-stock (the page fetches `products:listAll` on load and overlays an "out of stock" label). Prices and product names in the DB (seeded by `products:seedProducts`) must match the `data-product` attributes in `order.html` exactly, or the stock-status overlay won't find the card.

### Admin panel

`admin.html` is accessed via a client-side password gate (`?key=redthorn2026` in the footer link). It talks directly to Convex and provides:
- Order management (view by week, update status)
- Batch scheduling (create/edit/delete production runs)
- Product stock toggling
