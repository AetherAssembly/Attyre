// app.js — Router & initialization

import * as store from './store.js';
import { initTauriFs, isTauri } from './tauri-fs.js';
import { renderHome } from './pages/home.js';
import { renderWardrobe } from './pages/wardrobe.js';
import { renderAddItem } from './pages/add-item.js';
import { renderItemDetail } from './pages/item-detail.js';
import { renderSuggest } from './pages/suggest.js';
import { renderCalendar } from './pages/calendar.js';
import { renderSavedOutfits } from './pages/saved-outfits.js';
import { renderSettings } from './pages/settings.js';
import { renderStats } from './pages/stats.js';
import { renderHistory } from './pages/history.js';
import { renderPacking } from './pages/packing.js';
import { renderPrivacy } from './pages/privacy.js';

const app = document.getElementById('app');
export const APP_VERSION = '3.0.1';

// ── Screen reader announcer ───────────────────────────────

export function announceToScreenReader(message) {
  const el = document.getElementById('sr-announce');
  if (!el) return;
  el.textContent = '';
  setTimeout(() => { el.textContent = message; }, 50);
}

// ── Mode helpers ──────────────────────────────────────────

export function updateAccessibilityMode(on) {
  document.documentElement.classList.toggle('accessibility-mode', on);
  const icon = document.querySelector('link[rel="icon"]');
  if (icon) icon.href = on ? 'assets/attyre-logo-sm-cb.svg' : 'assets/attyre-logo-small.svg';
  announceToScreenReader(on ? 'Accessibility mode enabled' : 'Accessibility mode disabled');
}

export function updateDarkMode(on) {
  document.documentElement.classList.toggle('dark-mode', on);
}

function initModes() {
  updateAccessibilityMode(store.isAccessibilityMode());
  updateDarkMode(store.isDarkMode());
}

// ── Routing ───────────────────────────────────────────────

function parseRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);
  return { hash, parts };
}

function renderErrorCard(message) {
  app.innerHTML = `
    <div style="padding:2rem;text-align:center;max-width:400px;margin:4rem auto;">
      <p style="font-size:2rem;margin-bottom:1rem;">⚠️</p>
      <h2 style="margin-bottom:.5rem;">Something went wrong</h2>
      <p style="opacity:.7;margin-bottom:1.5rem;">${message}</p>
      <a href="#/" style="display:inline-block;padding:.6rem 1.2rem;background:var(--color-primary,#C9A96E);color:#fff;border-radius:8px;text-decoration:none;">Go Home</a>
    </div>`;
}

async function renderPage() {
  const { hash, parts } = parseRoute();
  initModes();

  // Fade out
  if (app.children.length) app.style.opacity = '0';
  await new Promise(r => setTimeout(r, 120));
  app.innerHTML = '';

  try {
    if (hash === '/' || hash === '') {
      renderHome(app);
    } else if (parts[0] === 'wardrobe') {
      if (parts.length === 1)       renderWardrobe(app);
      else if (parts[1] === 'add')  renderAddItem(app);
      else                          renderItemDetail(app, parts[1]);
    } else if (parts[0] === 'suggest') {
      renderSuggest(app);
    } else if (parts[0] === 'calendar') {
      renderCalendar(app);
    } else if (parts[0] === 'saved-outfits') {
      renderSavedOutfits(app);
    } else if (parts[0] === 'stats') {
      renderStats(app);
    } else if (parts[0] === 'settings') {
      renderSettings(app);
    } else if (parts[0] === 'history') {
      renderHistory(app);
    } else if (parts[0] === 'packing') {
      renderPacking(app);
    } else if (parts[0] === 'privacy') {
      renderPrivacy(app);
    } else {
      renderHome(app);
    }
  } catch (err) {
    console.error('Page render failed:', err);
    renderErrorCard('Unable to load this page. Try refreshing or going home.');
  }

  updateActiveNav(hash);
  app.style.opacity = '1';
  const pageTitle = app.querySelector('h1');
  if (pageTitle) announceToScreenReader(pageTitle.textContent.trim());
}

function updateActiveNav(hash) {
  let route = 'home';
  if (hash.startsWith('/wardrobe'))     route = 'wardrobe';
  else if (hash.startsWith('/suggest')) route = 'suggest';
  else if (hash.startsWith('/calendar')) route = 'calendar';
  else if (hash.startsWith('/saved-outfits')) route = 'saved-outfits';
  else if (hash.startsWith('/stats'))   route = 'stats';
  else if (hash.startsWith('/settings')) route = 'settings';
  else if (hash.startsWith('/history')) route = 'history';
  else if (hash.startsWith('/packing')) route = 'packing';

  document.querySelectorAll('[data-route]').forEach(el => {
    el.classList.toggle('active', el.dataset.route === route);
  });
}

async function init() {
  await initTauriFs(); // resolves instantly in the browser (no-op)
  initModes();
  renderPage();
  if (isTauri()) {
    import('./updater.js').then(m => m.silentUpdateCheck(app)).catch(() => {});
  }
}

window.addEventListener('hashchange', renderPage);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
