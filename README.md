# Attyre

[![Version](https://img.shields.io/badge/version-2026.04.24-C9A96E)](CHANGELOG.md)
[![License: GPL v3](https://img.shields.io/badge/license-GPLv3-blue.svg)](LICENSE)
[![No Account Required](https://img.shields.io/badge/no%20account-required-4A7C59)](Privacy-Policy.html)
[![Privacy Policy](https://img.shields.io/badge/privacy-policy-16a34a)](Privacy-Policy.html)

Smart wardrobe manager with weather-based suggestions, planning tools, and local-first privacy.

Current app version: 2026.04.24

## What Attyre Does

- Manage clothing items with category, color, warmth, seasons, occasions, weather tags, notes, and optional image.
- Suggest outfits using live weather based on city input.
- Plan outfits by date in a calendar view.
- Save and reuse outfit combinations.
- Track usage and view stats across categories, seasons, warmth, and wear counts.
- Run fully client-side with no account or backend.

## Current UI and Navigation

- Desktop layout uses a left sidebar with routes for Home, Wardrobe, Suggest Outfit, Plan Outfit, Saved Outfits, Stats, and Settings.
- Mobile layout uses a top bar, hamburger sidebar, and bottom navigation.
- Active route highlighting is synchronized across desktop and mobile nav items.

## Routes

- #/ home dashboard
- #/wardrobe wardrobe list and filters
- #/wardrobe/add add item form
- #/wardrobe/:id item detail and edit
- #/suggest weather-based suggestions
- #/calendar outfit planning by date
- #/saved-outfits saved combinations
- #/stats analytics dashboard
- #/settings preferences, backup/restore, links, version

## Feature Details

### Wardrobe Management

- Add, edit, and delete items.
- Search by name and color.
- Filter by category and season.
- Filter by weather tags using multi-select chips.

### Image Handling

- Add flow includes optional image upload.
- Cropper.js is used in add flow for image cropping.
- Images are stored as data URLs.

### Suggest Outfit

- Geocoding via OpenStreetMap Nominatim.
- Weather via Open-Meteo current weather endpoint.
- Retry logic with backoff for external API calls.
- Ranking engine scores by category fit and weather-tag fit.

### Planning and Saved Outfits

- Calendar supports month navigation and day selection.
- Assign one or more items to a date.
- Increment item usage when outfits are saved to a date.
- Save named outfit combinations and delete when needed.

### Stats and Insights

- Summary cards for total items, total wears, planned days, never worn.
- Breakdowns by category, season, warmth, and occasion.
- Most worn list and never worn list.

### Accessibility and Theming

- Dark mode toggle.
- Accessibility mode toggle with safe high-contrast palette and icon support.
- Accessibility mode also switches favicon variant.

## Data Model and Storage

Data is stored in browser localStorage.

- attyre_items item collection, stored compressed with LZString when saved.
- attyre_saved_outfits saved outfit combinations.
- attyre_outfit_dates date-to-item mapping for planning.
- attyre_dark_mode dark mode preference.
- attyre_accessibility accessibility mode preference.
- attyre_colorblind legacy key retained for backward compatibility.

Important: clearing browser storage removes app data.

## Backup and Restore

- Export writes a JSON backup file for items.
- Import validates basic item shape before saving.
- Import success redirects users to wardrobe view.

## Suggestion Logic

Temperature bands used by the engine:

- 0C and below: very cold labels and cold/snow tags.
- up to 10C: cold labels and cold/wind tags.
- up to 18C: cool labels and cloudy tags.
- up to 24C: mild labels and sunny tags.
- above 24C: warm labels and hot/sunny tags.

Scoring:

- +2 when mapped category matches a needed label.
- +1 per matching weather tag.
- Top unique categories are selected, up to four items.

## Progressive Web App

- Web app manifest is included.
- Standalone display and app shortcuts are configured.
- Install prompts depend on browser and platform support.

## External Dependencies

CDN dependencies loaded in app shell:

- LZString 1.5.0 for item data compression.
- Cropper.js 1.5.13 for image cropping in add flow.

## External APIs

- Nominatim search endpoint for city geocoding.
- Open-Meteo forecast endpoint for current weather.
- User-Agent currently set to Attyre/2026.04.24 (attyre.aetherassembly.org) for Nominatim requests.

## Project Structure

Top-level structure:

- index.html app shell and navigation
- style.css full styling and theme tokens
- manifest.json PWA metadata and shortcuts
- js/app.js router, mode initialization, version export
- js/store.js local storage operations and backup helpers
- js/engine.js pure suggestion engine and ranking
- js/pages/* route-level page renderers
- js/components/item-card.js reusable item card view
- assets/* logos and icons

## Privacy and Security

- Local-first by design: no app backend.
- No login and no analytics pipeline in app code.
- User-facing docs include privacy and security policy files.

## Browser Support

Requires modern browser support for:

- ES modules
- fetch
- crypto.randomUUID
- localStorage
- FileReader

## License

GNU GPL v3.0.

## Live App

[https://attyre.aetherassembly.org](https://attyre.aetherassembly.org)
