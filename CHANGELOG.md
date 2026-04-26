# Changelog

All notable changes to Attyre will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Current Version [v2026.04.26] - 2026-04-26 *(automated fixes by Claude Code)*

### Fixed (v2026.04.26)

- **Category validation error now visible**: `add-item` and `item-detail` forms were missing the `category-error` element, so the "Category is required" message was silently swallowed — error paragraph now rendered correctly under the category select.
- **Crop button re-usable after first crop**: After applying a crop in the add-item form, the replacement preview button had no event listener attached, making subsequent crops impossible — listener is now re-wired via a recursive helper after each crop.
- **localStorage quota errors surfaced**: `saveItems` was catching `QuotaExceededError` silently; it now re-throws so callers can alert the user when storage is full.

### Changed (v2026.04.26)

- **PWA manifest colours corrected**: `theme_color` was a leftover placeholder purple (`#6C63FF`) — updated to the app's actual gold (`#C9A96E`); `background_color` updated to match light-mode page background (`#F5F0E8`); placeholder screenshot SVGs updated to match; `start_url` corrected from `/index.html` to `/`.

### Technical Improvements (v2026.04.26)

- **SRI hashes added to CDN scripts**: `integrity` + `crossorigin="anonymous"` attributes added to all three CDN tags (lz-string, Cropper.js JS and CSS) to guard against CDN compromise.
- **APP_VERSION CI regex tightened**: Deploy-preview workflow regex now enforces the strict `YYYY.MM.DD` format instead of accepting any sequence of digits and dots.
- **Label-sync workflow fixed**: Added `pip install pyyaml` step before the YAML parse step, which would otherwise fail with `ModuleNotFoundError` since `yaml` is not in Python's standard library.
- **LZString null check corrected**: `getItems` fallback now checks `=== null` instead of falsy, correctly handling the edge case where LZString returns an empty string.

---

## Prior Release [v2026.04.24] - 2026-04-24

### Added (Current Version)

- **Responsive App Shell**: Added a full desktop sidebar + mobile topbar/bottom-nav navigation system for clearer routing and faster access to core pages.
- **New Stats Page**: Introduced a dedicated stats view (`#/stats`) with category/season/warmth breakdowns, usage insights, and most-worn/never-worn analysis.
- **Expanded Wardrobe Filtering**: Added weather-tag filter chips on wardrobe browsing in addition to text, category, and season filters.

### Changed (Current Version)

- **Visual Redesign (v2)**: Reworked the global interface with a warm theme, updated typography, refreshed cards, buttons, alerts, and page layouts.
- **Home Experience**: Redesigned quick actions, outfit inspiration, saved outfit preview, and usage highlights for better at-a-glance insights.
- **Suggest Workflow**: Improved city input UX, loading/error states, weather card presentation, and ranked suggestion display.
- **Calendar Planning UX**: Rebuilt month navigation and date selection with richer day states (today/selected/has-outfit) and streamlined outfit assignment.
- **Component Refresh**: Updated item cards with SVG category icons and improved fallback rendering when images are unavailable.

### Technical Improvements (Current Version)

- **Router Enhancements**: Added `stats` route integration and synchronized active-state handling across sidebar and bottom navigation.
- **Mode Initialization Cleanup**: Simplified dark/accessibility mode application and favicon switching logic on startup and route renders.
- **Codebase Structure Updates**: Refactored page modules (`home`, `wardrobe`, `suggest`, `calendar`) for cleaner rendering flow and reusable UI behavior.
- **Version Bump**: Updated app constant to `APP_VERSION = '2026.04.24'` for this release.
- **Github Workflows**: Added Github Workflows for Pull Requests and Issues.

## Prior Release [v1.5.0] - 2026-03-10

### Added (v1.5.0)

- **Accessibility Mode**: Comprehensive colorblind-friendly interface supporting all types of colorblindness (protanopia,deuteranopia, tritanopia, achromatopsia) with safe color palette and visual icons
- **Advanced Wardrobe Filtering**: Category and season filters in addition to text search
- **Usage Analytics**: Track and display most worn items on the home page
- **Enhanced Error Handling**: Retry logic with exponential backoff for weather API calls
- **Improved Mobile Responsiveness**: Better touch targets and grid layouts for small screens
- **Data Compression**: LZ-string compression for localStorage to reduce storage size and improve performance
- **Image Crop Tool**: Integrated Cropper.js for cropping item photos before saving
- **Quick Links**: Added links to Landing Pad newsletter, Helpdesk Discord, and GitHub profile in settings

### Changed (v1.5.0)

- **Colorblind Mode** renamed to **Accessibility Mode** with expanded functionality
- **Wardrobe Search** now includes dropdown filters for better organization
- **Status Messages** now include icons (✓, ⚠, ❌) alongside colors for better accessibility

### Technical Improvements (v1.5.0)

- Added usage tracking for wardrobe items
- Implemented API retry mechanism for better reliability
- Updated CSS custom properties for consistent theming
- Enhanced mobile CSS with improved touch interactions

## Initial Release of Attyre [v1.0.0] - 2026-03-03

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
