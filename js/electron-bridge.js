// electron-bridge.js — Desktop helpers for the Electron build.
// All exports are safe to call in the browser: they become no-ops or pass-throughs.

let _appDataPath = null;

export function isElectron() {
  return typeof window !== 'undefined' && !!window.electron;
}

export async function initElectronBridge() {
  if (!isElectron()) return;
  try {
    _appDataPath = await window.electron.getAppDataPath();
  } catch (e) {
    console.error('[electron-bridge] Failed to get app data path:', e);
  }
}

// Save a base64 data URL as a file under userData/images/.
// Returns a 'tauri-img:{filename}' reference on desktop (kept for backward
// compat with items saved under Tauri), or the original dataUrl in the browser.
export async function saveImageFile(dataUrl) {
  if (!isElectron()) return dataUrl;
  const ext = dataUrl.startsWith('data:image/png') ? 'png' : 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const dataBase64 = dataUrl.split(',')[1];
  try {
    await window.electron.saveImage(filename, dataBase64);
    return `tauri-img:${filename}`;
  } catch (e) {
    console.error('[electron-bridge] Failed to save image:', e);
    return dataUrl;
  }
}

// Resolve any imageUri to a URL the WebView can display.
//   data:      -> pass through (legacy base64 items)
//   tauri-img: -> convert to app://images/<filename> (served by custom protocol)
//   anything else -> pass through
export function resolveImageUri(uri) {
  if (!uri) return '';
  if (!isElectron()) return uri;
  if (uri.startsWith('data:')) return uri;
  if (uri.startsWith('tauri-img:')) {
    return `app://images/${uri.slice('tauri-img:'.length)}`;
  }
  return uri;
}

// Open a URL in the system browser (desktop) or a new tab (browser).
export async function openLink(url) {
  if (isElectron()) {
    window.electron.openLink(url);
  } else {
    window.open(url, '_blank', 'noopener');
  }
}
