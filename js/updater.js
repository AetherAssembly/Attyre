// updater.js — Auto-update helpers (Electron desktop only, Linux/Windows)

import { isElectron, openLink } from './electron-bridge.js';

export async function checkForUpdates(statusEl, btnEl) {
  if (!isElectron()) return;

  btnEl.disabled = true;
  statusEl.textContent = 'Checking…';

  if (navigator.userAgent.includes('Macintosh')) {
    showGitHubFallback(statusEl);
    btnEl.disabled = false;
    return;
  }

  window.electron.onUpdateDownloaded(info => {
    statusEl.textContent = `v${info.version} installed. Restarting…`;
    window.electron.installUpdate();
  });

  try {
    const version = await window.electron.checkForUpdates();
    statusEl.textContent = version
      ? `v${version} available — downloading…`
      : "You're on the latest version.";
  } catch (err) {
    const msg = err.message ?? String(err);
    if (msg.includes('platforms')) {
      showGitHubFallback(statusEl);
    } else {
      statusEl.textContent = `Update check failed: ${msg}`;
    }
  } finally {
    btnEl.disabled = false;
  }
}

export async function silentUpdateCheck(appEl) {
  if (!isElectron()) return;
  if (navigator.userAgent.includes('Macintosh')) return;
  try {
    const version = await window.electron.checkForUpdates();
    if (version) showUpdateBanner(appEl, version);
  } catch {
    // Silent — don't surface startup check errors to the user
  }
}

function showGitHubFallback(statusEl) {
  statusEl.innerHTML = 'Auto-update is not available on macOS. <a id="releases-link" style="color:var(--color-primary,#C9A96E)">View releases on GitHub</a>';
  statusEl.querySelector('#releases-link').addEventListener('click', e => {
    e.preventDefault();
    openLink('https://github.com/AetherAssembly/Attyre/releases');
  });
}

function showUpdateBanner(appEl, newVersion) {
  if (document.getElementById('update-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.style.cssText = `
    position:fixed;bottom:0;left:0;right:0;z-index:9999;
    background:var(--color-primary,#C9A96E);color:#fff;
    display:flex;align-items:center;justify-content:space-between;
    padding:10px 16px;font-size:14px;gap:12px;
  `;
  banner.innerHTML = `
    <span>Attyre v${newVersion} is available.</span>
    <div style="display:flex;gap:8px;flex-shrink:0">
      <a href="#/settings" style="color:#fff;font-weight:600;text-decoration:underline">Update in Settings</a>
      <button id="update-banner-dismiss" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;line-height:1;padding:0 4px">&times;</button>
    </div>
  `;
  appEl.parentElement?.insertBefore(banner, appEl) ?? document.body.appendChild(banner);
  banner.querySelector('#update-banner-dismiss').addEventListener('click', () => banner.remove());
}
