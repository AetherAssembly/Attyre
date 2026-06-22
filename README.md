# Attyre

> Your wardrobe, weather-aware.

[![Version](https://img.shields.io/badge/version-v4.2.0-C9A96E)](CHANGELOG.md)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
[![Privacy Policy](https://img.shields.io/badge/privacy-policy-16a34a)](PRIVACY.md)
[![Electron](https://img.shields.io/badge/electron-39-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)

[![Linux](https://img.shields.io/badge/Linux-AppImage%20%C2%B7%20.deb%20%C2%B7%20.rpm-FCC624?logo=linux&logoColor=black)](https://github.com/AetherAssembly/Attyre/releases)
[![Windows](https://img.shields.io/badge/Windows-NSIS-0078D4?logo=windows&logoColor=white)](https://github.com/AetherAssembly/Attyre/releases)
[![macOS](https://img.shields.io/badge/macOS-DMG-000000?logo=apple&logoColor=white)](https://github.com/AetherAssembly/Attyre/releases)
[![Wiki](https://img.shields.io/badge/wiki-documentation-555555?logo=github&logoColor=white)](https://aetherassembly.org/wiki/attyre)

Attyre is a desktop app that helps you manage your wardrobe and decide what to wear based on the actual weather. It works completely offline — no account, no cloud sync, no tracking. Your data lives on your device and nowhere else.

---

## Features

- **Wardrobe management:** add items with category, color, warmth, seasons, occasions, weather tags, and an optional photo
- **Weather-based suggestions:** enter any city to get ranked outfit picks based on live temperature and conditions
- **Outfit planning:** calendar view to assign outfits to specific dates; wear counts update automatically
- **Saved outfits:** name and save combinations to reuse later
- **Stats dashboard:** total wears, most worn, never worn, and breakdowns by category, season, warmth, and occasion
- **Wardrobe filters:** search by name or color, filter by category, season, or weather tags
- **Image cropping:** built-in crop tool when adding or editing item photos
- **Dark mode and accessibility mode:** colorblind-friendly palette, larger text, stronger borders
- **Backup and restore:** export your wardrobe as JSON; import merges with existing items
- **Fully offline:** no account, no backend, no tracking

---

## Download

Grab the latest release from the [Releases](https://github.com/AetherAssembly/Attyre/releases) page.

### Windows

Run the NSIS installer (`Attyre-4.2.0-Setup.exe`) and follow the prompts.

> Attyre is not signed with a Microsoft certificate. Windows SmartScreen may show a warning — click **More info** then **Run anyway** to proceed.

To uninstall: **Settings → Apps**, find Attyre, and remove it from there.

---

### macOS

Open the DMG, drag Attyre to your Applications folder, and try to launch it. macOS will block it because the app is unsigned.

To allow it, open **System Settings → Privacy & Security**, scroll down to the blocked app, and click **Open Anyway**. You only need to do this once.

Alternatively, run this in Terminal:

```bash
xattr -d com.apple.quarantine /Applications/Attyre.app
```

---

### Linux

Three formats are available for x86_64: **AppImage**, **.deb** (Debian/Ubuntu), and **.rpm** (Fedora/RHEL/openSUSE).

> To run AppImages easily, try [Gear Lever](https://github.com/mijorus/gearlever) (GNOME) or [Shelly](https://shellyalpm.com/) (CachyOS).

**Debian / Ubuntu**
```bash
sudo apt install ./Attyre_4.2.0_amd64.deb
sudo apt remove attyre        # to uninstall
```

**Fedora / RHEL / Rocky / Alma**
```bash
sudo dnf install ./Attyre-4.2.0-1.x86_64.rpm
sudo dnf remove attyre        # to uninstall
```

**openSUSE**
```bash
sudo zypper install ./Attyre-4.2.0-1.x86_64.rpm
sudo zypper remove attyre     # to uninstall
```

---

## Development

### Prerequisites

Node.js 18+ and npm.

### Setup

```bash
git clone https://github.com/AetherAssembly/Attyre.git
cd Attyre
npm install
```

### Run

```bash
npm run dev            # Vite dev server at http://localhost:1420
npm run electron:dev   # Full desktop app (Vite + Electron together)
```

### Build

```bash
npm run build           # Vite frontend only → dist/
npm run electron:build  # Full desktop build → release/
```

Release builds for all platforms are handled automatically by GitHub Actions when a version tag is pushed.

### Tests

```bash
npm test          # Unit tests
npm run lint:css  # CSS class regression check
```

---

## Privacy

All your data stays on your device. The only outbound requests Attyre ever makes are optional weather lookups (city name only) to [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org) and [Open-Meteo](https://open-meteo.com) when you use the Suggest or Pack features. No telemetry, no analytics, no accounts.

See [PRIVACY.md](PRIVACY.md) for the full policy.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for setup instructions, branching conventions, and the PR checklist.

---

## License

[AGPL-3.0](LICENSE)
