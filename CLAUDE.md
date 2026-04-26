# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Attyre is a **local-first Progressive Web App** — a vanilla JS wardrobe manager with no backend, no build step, and no framework. All data lives in `localStorage`. The app is served as static files and deployed to Cloudflare.

## Development

```bash
# Serve locally
python3 -m http.server 8000
# App available at http://localhost:8000
```

There is no npm, no bundler, no transpilation step. The app runs directly in the browser as ES modules.

## CI Checks (must pass on PRs)

- **Smoke test** (`.github/workflows/deploy-preview.yml`): starts `python3 -m http.server 8000`, verifies all static assets return HTTP 200, validates `manifest.json` is valid JSON, and confirms `APP_VERSION` in `js/app.js` matches the format `'YYYY.MM.DD'` (e.g. `'2026.04.24'`).
- **Changelog check**: validates that `CHANGELOG.md` was updated.
- **PR size check**: warns on large PRs.

## Architecture

The app is split into four clear layers:

| Layer | Files | Responsibility |
|---|---|---|
| Routing | `js/app.js` | Hash-based router (`#/route`), mode init (dark/accessibility), fade transitions |
| Data | `js/store.js` | localStorage CRUD; items are LZString-compressed with a raw-JSON fallback |
| Logic | `js/engine.js` | Pure ranking engine — no DOM, no side effects |
| Pages | `js/pages/*.js` | One `render*()` function per page; imperative innerHTML + event listeners |

`js/components/item-card.js` is the only shared UI component.

### Data model

```js
Item: { id, name, category, color?, warmth(1-5), seasons?, occasions?, weatherTags?, imageUri?(dataURL), usage, createdAt }
SavedOutfit: { id, name, itemIds[], createdAt }
OutfitDates: { 'YYYY-MM-DD': [itemId, ...] }
```

Storage keys: `attyre_items` (LZString), `attyre_saved_outfits`, `attyre_outfit_dates`, `attyre_dark_mode`, `attyre_accessibility`.

### External APIs (no auth required)

- **Nominatim** (OpenStreetMap) — city geocoding; User-Agent must be `Attyre/YYYY.MM.DD (attyre.aetherassembly.org)`
- **Open-Meteo** — current weather forecast

## Key Conventions

**XSS prevention** — every page defines a local `esc()` helper and uses it for all user-supplied strings in template literals. Never interpolate raw user data into `innerHTML`.

**Page rendering pattern** — each `js/pages/*.js` exports a single `render**(container)` function that creates a `div.page-wrap`, sets its `innerHTML`, appends it to `container`, then wires up event listeners.

**No global state** — pages call `store.*()` directly; changes are persisted immediately on blur/submit.

**Accessibility vs. Dark Mode** — two independent boolean flags. Accessibility mode (`attyre_accessibility`) swaps the gold accent for blue and switches the favicon to the colorblind-safe variant. They do not imply each other.

**Image storage** — images are stored as data URLs inside `localStorage`. Cropper.js (CDN) handles client-side cropping before save. No external image host.

**Backwards compatibility** — `store.js` silently falls back from LZString to raw JSON if decompression fails. The legacy `attyre_colorblind` key is ignored.

**Version string** — `APP_VERSION` in `js/app.js` must be kept in `'YYYY.MM.DD'` format; CI enforces this with a regex.
