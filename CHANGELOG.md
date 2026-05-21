# Changelog

All notable changes to Attyre will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
