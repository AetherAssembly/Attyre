// tauri-fs.js — Filesystem helpers for the Tauri desktop build.
// All exports are safe to call in the browser: they become no-ops or pass-throughs.

let _appDataPath = null;

export function isTauri() {
  return typeof window !== 'undefined' && !!window.__TAURI__;
}

// Call once at app startup (awaited before first render).
// Caches the app data directory so resolveImageUri can stay synchronous.
export async function initTauriFs() {
  if (!isTauri()) return;
  try {
    _appDataPath = await window.__TAURI__.path.appDataDir();
  } catch (e) {
    console.error('[tauri-fs] Failed to get app data dir:', e);
  }
}

// Save a base64 data URL as a file under $APPDATA/images/.
// Returns a 'tauri-img:{filename}' reference on desktop,
// or the original dataUrl unchanged in the browser.
export async function saveImageFile(dataUrl) {
  if (!isTauri()) return dataUrl;
  const ext = dataUrl.startsWith('data:image/png') ? 'png' : 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const dataBase64 = dataUrl.split(',')[1];
  try {
    await window.__TAURI__.core.invoke('save_image', { filename, dataBase64 });
    return `tauri-img:${filename}`;
  } catch (e) {
    console.error('[tauri-fs] Failed to save image:', e);
    return dataUrl; // fall back to storing base64 so nothing is lost
  }
}

// Resolve any imageUri to a URL the WebView can display.
//   data:  → pass through (legacy base64 items)
//   tauri-img:  → convert to an asset:// URL via convertFileSrc
//   anything else → pass through
// Open a URL in the system browser (desktop) or a new tab (browser).
export async function openLink(url) {
  if (isTauri()) {
    const { openUrl } = await import(/* @vite-ignore */ '@tauri-apps/plugin-opener');
    await openUrl(url);
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

export function resolveImageUri(uri) {
  if (!uri) return '';
  if (!isTauri() || !_appDataPath) return uri;
  if (uri.startsWith('data:')) return uri;
  if (uri.startsWith('tauri-img:')) {
    const filename = uri.slice('tauri-img:'.length);
    // appDataDir() always ends with a path separator on all platforms
    const fullPath = `${_appDataPath}images/${filename}`;
    return window.__TAURI__.core.convertFileSrc(fullPath);
  }
  return uri;
}
