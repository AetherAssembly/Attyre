# Attyre

> Your wardrobe, weather-aware.

[![Version](https://img.shields.io/badge/version-v4.0.1-C9A96E)](CHANGELOG.md)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
[![Privacy Policy](https://img.shields.io/badge/privacy-policy-16a34a)](Privacy-Policy.html)
[![Electron](https://img.shields.io/badge/electron-36-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)

[![Linux](https://img.shields.io/badge/Linux-AppImage%20%C2%B7%20.deb%20%C2%B7%20.rpm-FCC624?logo=linux&logoColor=black)](https://github.com/AetherAssembly/Attyre/releases)
[![Windows](https://img.shields.io/badge/Windows-NSIS-0078D4?logo=windows&logoColor=white)](https://github.com/AetherAssembly/Attyre/releases)
[![macOS](https://img.shields.io/badge/macOS-DMG-000000?logo=apple&logoColor=white)](https://github.com/AetherAssembly/Attyre/releases)
[![Web](https://img.shields.io/badge/web-attyre.org-C9A96E)](https://attyre.org)

Manage your wardrobe, get weather-based outfit suggestions, and plan what to wear — all offline, no account required, all data stays on your device.

---

## Features

- **Wardrobe management** — add items with category, color, warmth, seasons, occasions, weather tags, notes, and an optional photo
- **Weather-based suggestions** — enter any city to get ranked outfit picks based on live temperature and conditions
- **Outfit planning** — calendar view to assign outfits to specific dates; usage counts update automatically
- **Saved outfits** — name and save combinations to reuse later
- **Stats dashboard** — total wears, most worn, never worn, breakdowns by category, season, warmth, and occasion
- **Wardrobe filters** — search by name or color, filter by category, season, or weather tags
- **Image cropping** — built-in crop tool when adding or editing item photos
- **Dark mode and accessibility mode** — colorblind-friendly palette, larger text, stronger borders
- **Backup and restore** — export your wardrobe as JSON; import merges with existing items
- **Fully offline** — no account, no backend, no tracking

---

## Download

Grab the latest build from the [Releases](https://github.com/AetherAssembly/Attyre/releases) page, or use the web app at [attyre.org](https://attyre.org) — no install needed.

| Platform | Formats |
| --- | --- |
| Linux (x86_64) | AppImage · `.deb` (Debian/Ubuntu) · `.rpm` (Fedora/RHEL/openSUSE) |
| Windows | NSIS installer |
| macOS | DMG |
| Web | [attyre.org](https://attyre.org) |

---

## Windows

Run the NSIS installer (`Attyre-4.0.1-Setup.exe`) and follow the prompts.

> Attyre is not signed with a Microsoft certificate. Windows SmartScreen may show a warning. Click **More info** → **Run anyway** to proceed.

### Uninstall

Go to **Settings → Apps**, find Attyre, and uninstall from there.

---

## macOS

Open the DMG, drag Attyre to your Applications folder, and launch it.

> Attyre is not notarized. macOS Gatekeeper will block the first launch. Right-click the app → **Open** → **Open** to allow it. You only need to do this once.

---

## Linux

> To run AppImages easily, try [Gear Lever](https://github.com/mijorus/gearlever) (GNOME) or [Shelly](https://shellyalpm.com/) (CachyOS).

### Debian / Ubuntu

```bash
sudo apt install ./Attyre_4.0.1_amd64.deb
```

> Using `apt install ./` rather than `dpkg -i` ensures apt resolves any missing dependencies automatically.

#### Uninstall

```bash
sudo apt remove attyre
```

### Fedora / RHEL / Rocky / Alma

```bash
sudo dnf install ./Attyre-4.0.1-1.x86_64.rpm
```

#### Uninstall

```bash
sudo dnf remove attyre
```

### openSUSE

```bash
sudo zypper install ./Attyre-4.0.1-1.x86_64.rpm
```

#### Uninstall

```bash
sudo zypper remove attyre
```

---

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

```bash
git clone https://github.com/AetherAssembly/Attyre.git
cd Attyre
npm install
```

### Run

**Web/PWA (Vite dev server):**

```bash
npm run dev
```

App available at `http://localhost:1420`.

**Desktop (Electron):**

```bash
npm run electron:dev
```

### Build

```bash
npm run build           # Vite only (frontend) → dist/
npm run electron:build  # Full desktop build → release/
```

Release builds for all platforms are handled automatically by GitHub Actions when a version tag is pushed.

---

## Privacy

All data is stored locally on your device: in `localStorage` on the web, and in the OS app data directory on desktop. Nothing is sent to any server except optional weather lookups (city name only) to [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org) and [Open-Meteo](https://open-meteo.com), which you trigger explicitly. See [Privacy-Policy.html](Privacy-Policy.html).

---

## License

[AGPL-3.0](LICENSE)
