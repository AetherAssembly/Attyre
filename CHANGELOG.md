# Changelog

All notable changes to Attyre will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Current Release

## [v4.1.0] - 2026-06-16

### Fixed

- Path traversal vulnerability in Electron image handling: filenames from the `app://` protocol and the `save-image` IPC handler are now validated to reject `..` sequences and path separators, preventing reads/writes outside the `images/` directory.
- Silent wardrobe data loss when localStorage contained neither valid compressed nor valid plain JSON: the corrupted-data case is now distinguished from the legacy uncompressed path and logs an explicit error instead of silently returning an empty array.
- `importJSON` no longer accepts items with unrecognised category values; category is now validated against the valid set (`top`, `bottom`, `outerwear`, `shoes`, `accessory`) and throws a descriptive error on mismatch.
- Outfit suggestion scoring now matches categories case-insensitively, so items with uppercase category values in pre-existing data are no longer silently excluded from suggestions.
- Saving an outfit in the calendar page no longer leaves the UI silent on storage errors (such as `QuotaExceededError`); the error message is now shown to the user.
- Raw API and network error text is no longer surfaced to users in the suggest page; geocoding and weather fetch failures now show a clean message while logging the raw error to the console.

### Tests

- Added tests for `suggestForWeather`: tag merging between temperature and WMO weather code, and wind chill crossing a suggestion band boundary.
- Updated the category case-sensitivity test to reflect the corrected case-insensitive behaviour.

---

## [v4.0.2] - 2026-06-11

### Fixed

- Electron packaged build rendered a blank white screen: `vite.config.js` was missing `base: './'`, causing Vite to emit absolute asset paths (`/assets/index.css`) that Electron's `loadFile()` cannot resolve. All asset references are now relative (`./assets/…`).

### Removed

- Cloudflare Pages deployment and PWA infrastructure: `wrangler.jsonc`, `service-worker.js`, `manifest.json`, and the `wrangler` npm dependency have been removed. Attyre is now a desktop-only Electron app.
- `attyre.org` web badge and download table row from README.

### Changed

- Nominatim `User-Agent` strings updated from `attyre.org` to `github.com/AetherAssembly/Attyre`.
- `area: pwa` GitHub label removed.

---

## [v4.0.1] - 2026-06-11

### Added

- Readded macOS builds for Attyre.

### Fixed

- Bumped `electron` from 36.9.5 to 39.8.5.
- Resolved npm audit vulnerabilities: overrode `tar` to ^7.5.16 and `shell-quote` to ^1.8.4; audit now reports 0 vulnerabilities.
- CI release workflow: added `--publish never` to `electron-builder` build steps to prevent accidental artifact publishing during manual runs.

### Changed

- Updated Privacy Policy: corrected Electron app data paths for all three platforms (Windows, Linux, macOS), added macOS path, updated last-updated date.

---

## [v4.0.0] - 2026-06-11

### Changed

- **Desktop shell migrated from Tauri 2 (Rust) to Electron (Node.js)** — removes the entire Rust/GTK/WebKitGTK dependency chain
- **macOS support restored** — desktop app now builds for Linux, Windows, and macOS (dropped in v2.0.1)
- `js/tauri-fs.js` replaced by `js/electron-bridge.js`; all `isTauri()` calls updated to `isElectron()`
- Images on desktop are now served via a custom `app://` protocol registered in the Electron main process, replacing Tauri's `asset://` scheme
- Auto-updater (electron-updater) active on Linux and Windows; macOS shows a GitHub releases link instead (auto-update requires code signing on macOS)
- CI workflows updated: Rust toolchain and GTK system deps removed, macOS added as a build target
- Dev command changed from `npm run tauri:dev` to `npm run electron:dev`
- Build command changed from `npm run tauri:build` to `npm run electron:build`

### Fixed

- Eliminates RUSTSEC-2024-0429 (unsoundness in `glib::VariantStrIter::impl_get`) by removing the glib dependency entirely

## [v3.0.1] - 2026-06-02

- Bumped `actions/setup-node` from 4 to 6
- Bumped `vite` from 8.0.14 to 8.0.16
- Bumped `wrangler` from 4.94.0 to 4.96.0
- Adjusted all Attyre versions to v3.0.1

## Prior Releases

## [v3.0.0] - 2026-05-30

### Added

- **Smarter suggestions**: outfit engine now fetches wind speed and WMO weather code from Open-Meteo in addition to temperature
- **Wind chill adjustment**: applies the Environment Canada formula when temp is <=10°C and wind >= 4.8 km/h, shifting clothing bands so blustery days suggest heavier layers
- **Weather code to tag mapping**: WMO codes are mapped to weather tags (sunny, cloudy, rain, heavy-rain, snow, wind) and merged with temperature-band tags for more accurate item scoring
- **Occasion scoring**: `rankItems()` accepts an optional occasion parameter (casual, work, formal) and adds +1 to items whose occasions list includes it
- **Occasion toggle on Suggest page**: Casual / Work / Formal toggle re-ranks suggestions in memory without re-fetching weather
- **Recently-worn penalty**: items worn in the last 3 days receive -2 to their suggestion score, nudging the engine toward fresher picks
- **Laundry tracking**: marking an outfit as worn (via calendar) now sets `laundryStatus: dirty` and records `lastWorn` on each item; dirty items receive a -1 suggestion penalty
- **Mark as Clean button**: appears on the item detail page when an item is dirty; resets laundry status without a full save
- **Outfit history timeline**: new History page shows all past calendar outfits in reverse-chronological order, grouped by month, with a "Wear again" button that copies the outfit to today
- **Packing list generator**: new Pack page accepts a destination city and date range (up to 14 days), fetches a multi-day forecast, runs the suggestion engine per day, deduplicates across days, and renders a grouped checklist organised by category
- **Drag-and-drop wardrobe reordering**: items can be dragged to a new position when no filters are active; order is persisted to localStorage and restored on reload
- **Richer item cards**: each card now shows a "Last worn X days ago" / "Never worn" label and a laundry badge when the item needs washing
- **Card entrance animations**: item cards fade and slide up when the grid renders, with staggered delays on the first eight items
- **Toast notifications**: a slide-in toast system replaces inline status text for transient feedback
- **Needs Wash filter**: wardrobe filter bar now includes a "needs wash" chip to show only dirty items

### Changed

- `incrementItemUsage()` in store.js now also sets `lastWorn` to today and `laundryStatus` to `dirty`
- `suggestForTemp()` is unchanged for backward compatibility; the new `suggestForWeather({ tempC, windspeedKph, weatherCode })` is the preferred call site for full weather data
- Wardrobe filter chips now use a `.chip-active` CSS class instead of inline style overrides
- Version bumped to 3.0.0 across `package.json`, `tauri.conf.json`, `Cargo.toml`, `app.js`, `service-worker.js`, and README

## [v2.0.1] - 2026-05-20

### Fixed

- Fixed release workflows

### Removed

- Drop all macOS build targets, artifacts, and documentation.

## [v2.0.0] - 2026-05-20

### Added

- Tauri 2 desktop app for Linux and Windows (`npm run tauri:dev`, `npm run tauri:build`)
- Vite dev server replacing `python3 -m http.server` — hot module replacement, proper error overlays
- Filesystem image storage on desktop via custom `save_image` Rust command — images saved to `$APPDATA/images/` instead of localStorage, avoiding the 5–10 MB browser quota
- Service worker with network-first caching strategy for PWA offline support
- Per-page error boundaries — each render function now catches its own failures and shows an inline error message rather than a blank screen
- `npm run lint:css` script to catch CSS class name regressions before they ship
- `contact@aetherassembly.org` added as a second support contact in Settings
- **Auto-updater**: Settings page now shows a "Check for Updates" button (desktop only); a dismissible banner appears on startup if a new version is available
- **GitHub Actions release workflow**: pushing a version tag (`v*.*.*`) automatically builds Linux and Windows artifacts, generates a signed `latest.json` update manifest, and publishes the GitHub release
- **Add Item overhaul**: photo is now required and moved to the top of the form; dominant color is auto-detected from the uploaded image via Canvas API; item name is optional and auto-generated (`Shirt_001`, `Pants_002`, etc.) if left blank; warmth buttons now show temperature ranges; weather tags are auto-suggested when a warmth level is selected
- **Warmth scale clarified**: scale now runs 1 (Freezing, ≤0°C) → 5 (Hot, 25°C+) left to right, matching natural temperature intuition

### Fixed

- Mobile navigation bug: router now wraps all page renders in try/catch so a render error can never leave the page faded out and frozen
- Service worker no longer registers on localhost, preventing stale cached pages from masking dead dev servers
- Tauri dev server (port 1420) no longer leaks as an orphan process after the app window closes

### Changed

- Versioning scheme changed from date-based (`2026.05.18`) to semantic versioning (`v2.0.0`)
- App domain updated to `attyre.org`
- Desktop: "Your data is stored locally in this browser" warning is hidden — data is persisted in the OS app data directory, not the browser cache

---

## [v1.5.0] - 2026-05-18

### Fixed

- **Mobile pages appeared static (critical)**: `add-item.js`, `item-detail.js`, and `saved-outfits.js` were all referencing CSS class names that don't exist in `style.css` — buttons rendered as bare browser defaults, forms had no padding or structure, warmth buttons didn't flex, and checkboxes were unstyled. Fixed all three files to use the correct classes: `.page-wrap`, `.warmth-row`, `.checkbox-item`, `.btn-stack`, `.btn-group`, `.btn.btn-primary`, `.outfit-section`, etc.
- **Warmth validation silently failed on Edit Item (critical)**: `item-detail.js` called `showError('warmth-error', ...)` but no element with that ID existed in the DOM — users could submit with no warmth level selected and received no feedback. Added the missing `<p>` error element.
- **Crop modal rendered unstyled (critical)**: Both `add-item.js` and `item-detail.js` used `.crop-modal-content` on the crop modal container, but the stylesheet defines `.crop-modal-inner`. Fixed the class name in both files.
- **Calendar delete bypassed store error handling**: The delete-outfit handler in `calendar.js` hardcoded the `localStorage` key directly instead of going through the store, skipping all error handling. Added a `deleteOutfitDate(date)` helper to `store.js` and updated `calendar.js` to call it.
- **Shuffle button didn't shuffle**: The shuffle button on the Home page re-navigated to `#/`, which just re-ran `suggestForTemp(18)` and produced the same result every time. Now performs a Fisher-Yates shuffle over all wardrobe items and updates the chip row in-place.
- **Offline indicator offset on desktop**: The offline banner used `top: var(--topbar-height)` in the desktop media query, but the topbar is `display: none` on desktop — pushing the banner 56px down from where it should be. Fixed to `top: 0`.
- **Crop button missing on Edit Item page**: `item-detail.js` had no crop button wired up for the existing image or newly uploaded images. Now consistent with `add-item.js`.
- **`QuotaExceededError` silently swallowed in add/edit forms**: Both forms now catch storage quota errors and surface them to the user via the name field error element instead of failing silently.

---

## [v1.3.0] - 2026-05-11

### Fixed

- **Mobile app shell invisible on older phones**: `.app-shell` used `height: 100dvh` with no fallback — `dvh` is unsupported on iOS < 16 and Chrome < 108, causing the shell to collapse to zero height and render nothing. Added `height: 100vh` fallback immediately before the `dvh` line.
- **Initial page never renders on slow mobile connections**: `app.js` registered a `DOMContentLoaded` listener unconditionally, but ES modules are fetched asynchronously — on real phones the event can fire before the module loads, leaving `#app` permanently empty. Now guards with a `document.readyState` check so `renderPage()` always runs.
- **PWA `start_url` mismatch on iOS**: `manifest.json` had `"start_url": "/"` while the app uses hash routing — launching from the iOS home screen landed on a bare static file. Changed to `"/index.html#/"`.

### Added

- **Skip-to-content link**: Keyboard/switch-access users can now press Tab on any page to reveal a "Skip to main content" link that jumps focus directly to the `#app` region.
- **Global `:focus-visible` ring**: All interactive elements (buttons, links, item cards, calendar days) now show a visible gold focus outline when navigated by keyboard. Accessibility mode uses a thicker blue outline.
- **`prefers-reduced-motion` support**: All CSS transitions and animations are suppressed when the OS "Reduce Motion" setting is enabled.
- **Screen reader page announcements**: A hidden `aria-live` region announces the page title on every navigation and announces when accessibility mode is toggled on/off.
- **Wardrobe filter result announcements**: Screen readers are told how many items match the current filters (or "No items match your filters") whenever filters change.
- **Calendar date announcements**: Selecting a calendar day announces the date and whether an outfit is planned for that day.
- **Calendar keyboard navigation**: Calendar day cells now have `tabindex="0"` and respond to Enter/Space for selection, plus full ARIA grid semantics (`role="grid"`, `role="gridcell"`, `aria-selected`).
- **Item cards are focusable buttons**: Item cards changed from `<div>` to `<button>` — screen readers now announce them with the correct role and keyboard users get Enter/Space activation for free.
- **Outfit selector `aria-pressed` state**: When picking items for a calendar day, each card reflects its selected state via `aria-pressed` so screen readers can track selection without relying on visual-only border/background changes.
- **Form error linkage**: Name and category inputs in the add-item form are now connected to their inline error messages via `aria-describedby`.

### Changed

- **Accessibility mode improvements**: Beyond the existing color swap, accessibility mode now also increases the base font size to 16 px, strengthens border contrast, and thickens nav icon strokes for better legibility.

---

## [v1.2.0] - 2026-04-24

### Added

- **Responsive App Shell**: Added a full desktop sidebar + mobile topbar/bottom-nav navigation system for clearer routing and faster access to core pages.
- **New Stats Page**: Introduced a dedicated stats view (`#/stats`) with category/season/warmth breakdowns, usage insights, and most-worn/never-worn analysis.
- **Expanded Wardrobe Filtering**: Added weather-tag filter chips on wardrobe browsing in addition to text, category, and season filters.

### Changed

- **Visual Redesign (v2)**: Reworked the global interface with a warm theme, updated typography, refreshed cards, buttons, alerts, and page layouts.
- **Home Experience**: Redesigned quick actions, outfit inspiration, saved outfit preview, and usage highlights for better at-a-glance insights.
- **Suggest Workflow**: Improved city input UX, loading/error states, weather card presentation, and ranked suggestion display.
- **Calendar Planning UX**: Rebuilt month navigation and date selection with richer day states (today/selected/has-outfit) and streamlined outfit assignment.
- **Component Refresh**: Updated item cards with SVG category icons and improved fallback rendering when images are unavailable.
- **PWA manifest colours corrected**: `theme_color` was a leftover placeholder purple (`#6C63FF`) — updated to the app's actual gold (`#C9A96E`); `background_color` updated to match light-mode page background (`#F5F0E8`); placeholder screenshot SVGs updated to match; `start_url` corrected from `/index.html` to `/`.

### Technical Improvements

- **Router Enhancements**: Added `stats` route integration and synchronized active-state handling across sidebar and bottom navigation.
- **Mode Initialization Cleanup**: Simplified dark/accessibility mode application and favicon switching logic on startup and route renders.
- **Codebase Structure Updates**: Refactored page modules (`home`, `wardrobe`, `suggest`, `calendar`) for cleaner rendering flow and reusable UI behavior.
- **Version Bump**: Updated app constant to `APP_VERSION = '2026.04.24'` for this release.
- **Github Workflows**: Added Github Workflows for Pull Requests and Issues.
- **SRI hashes added to CDN scripts**: `integrity` + `crossorigin="anonymous"` attributes added to all three CDN tags (lz-string, Cropper.js JS and CSS) to guard against CDN compromise.
- **APP_VERSION CI regex tightened**: Deploy-preview workflow regex now enforces the strict `YYYY.MM.DD` format instead of accepting any sequence of digits and dots.
- **Label-sync workflow fixed**: Added `pip install pyyaml` step before the YAML parse step, which would otherwise fail with `ModuleNotFoundError` since `yaml` is not in Python's standard library.
- **LZString null check corrected**: `getItems` fallback now checks `=== null` instead of falsy, correctly handling the edge case where LZString returns an empty string.

### Fixed

- **Category validation error now visible**: `add-item` and `item-detail` forms were missing the `category-error` element, so the "Category is required" message was silently swallowed — error paragraph now rendered correctly under the category select.
- **Crop button re-usable after first crop**: After applying a crop in the add-item form, the replacement preview button had no event listener attached, making subsequent crops impossible — listener is now re-wired via a recursive helper after each crop.
- **localStorage quota errors surfaced**: `saveItems` was catching `QuotaExceededError` silently; it now re-throws so callers can alert the user when storage is full.

## [v1.1.0] - 2026-03-10

### Added (v1.1.0)

- **Accessibility Mode**: Comprehensive colorblind-friendly interface supporting all types of colorblindness (protanopia,deuteranopia, tritanopia, achromatopsia) with safe color palette and visual icons
- **Advanced Wardrobe Filtering**: Category and season filters in addition to text search
- **Usage Analytics**: Track and display most worn items on the home page
- **Enhanced Error Handling**: Retry logic with exponential backoff for weather API calls
- **Improved Mobile Responsiveness**: Better touch targets and grid layouts for small screens
- **Data Compression**: LZ-string compression for localStorage to reduce storage size and improve performance
- **Image Crop Tool**: Integrated Cropper.js for cropping item photos before saving
- **Quick Links**: Added links to Landing Pad newsletter, Helpdesk Discord, and GitHub profile in settings

### Changed (v1.1.0)

- **Colorblind Mode** renamed to **Accessibility Mode** with expanded functionality
- **Wardrobe Search** now includes dropdown filters for better organization
- **Status Messages** now include icons (✓, ⚠, ❌) alongside colors for better accessibility

### Technical Improvements (v1.1.0)

- Added usage tracking for wardrobe items
- Implemented API retry mechanism for better reliability
- Updated CSS custom properties for consistent theming
- Enhanced mobile CSS with improved touch interactions

## [v1.0.0] - 2026-03-03

### Added (v1.0.0)

- Weather-based outfit suggestions
- Wardrobe management with localStorage
- Dark mode and basic colorblind support
- PWA functionality
- Backup and restore features
- Image support for items

### Features (v1.0.0)

- Add, edit, and organize clothing items
- Weather-aware outfit recommendations
- Calendar-based outfit planning
- Saved outfit combinations
- Smart tagging system
- Export/import wardrobe data
