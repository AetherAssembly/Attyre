// updater.js — Tauri auto-update helpers (only loaded in the desktop app)

import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

// Called from the Settings page "Check for Updates" button.
export async function checkForUpdates(statusEl, btnEl) {
  btnEl.disabled = true;
  statusEl.textContent = 'Checking…';
  try {
    const update = await check();
    if (!update) {
      statusEl.textContent = "You're on the latest version.";
      return;
    }
    statusEl.textContent = `v${update.version} available — downloading…`;
    await update.downloadAndInstall();
    statusEl.textContent = 'Update installed. Restarting…';
    await relaunch();
  } catch (err) {
    console.error('[updater] check failed:', err);
    statusEl.textContent = `Update check failed: ${err.message ?? err}`;
  } finally {
    btnEl.disabled = false;
  }
}

// Called silently at app startup. Shows a dismissible banner if an update is available.
export async function silentUpdateCheck(appEl) {
  try {
    const update = await check();
    if (!update) return;
    showUpdateBanner(appEl, update.version);
  } catch {
    // Silent — don't surface startup check errors to the user
  }
}

function showUpdateBanner(appEl, newVersion) {
  if (document.getElementById('update-banner')) return; // already shown
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
