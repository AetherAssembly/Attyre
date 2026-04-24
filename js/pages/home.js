// pages/home.js

import * as store from '../store.js';
import * as engine from '../engine.js';
import { CATEGORY_EMOJI } from '../components/item-card.js';

function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

export function renderHome(container) {
  const items = store.getItems();
  const logoSrc = store.isAccessibilityMode() ? 'assets/attyre-wordmark-cb.svg' : 'assets/attyre-wordmark.svg';

  // Stats
  const cats = { top: 0, bottom: 0, outerwear: 0, shoes: 0, accessory: 0 };
  items.forEach(i => { if (cats[i.category] !== undefined) cats[i.category]++; });

  // Outfit of day (neutral 18°C so it doesn't lean too cold/warm)
  const suggestion = engine.suggestForTemp(18);
  const ranked = engine.rankItems(items, suggestion);

  // Most worn
  const mostWorn = items.filter(i => i.usage > 0).sort((a,b) => (b.usage||0)-(a.usage||0)).slice(0,5);

  // Saved outfits
  const savedOutfits = store.getSavedOutfits();

  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';

  wrap.innerHTML = `
    <div class="home-hero">
      <svg class="home-hero-logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50,26 L53,17 L59,11 L67,11 L73,17 L71,24 L64,27" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M50,26 L13,70 L8,77 L12,85 L88,85 L92,77 L87,70 Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M39,72 L50,41 L61,72" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="43" y1="61" x2="57" y2="61" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M50,34 L54,41 L50,48 L46,41 Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div>
        <h1 class="home-hero-title">Attyre</h1>
        <p class="home-hero-sub">Your wardrobe, weather-aware.</p>
      </div>
    </div>

    <div class="alert alert-warning" style="margin-bottom:20px">
      <span class="alert-icon">⚠</span>
      <span>Your data is stored locally in this browser. <strong>Export a backup in Settings</strong> before clearing your cache.</span>
    </div>

    <!-- Quick tiles -->
    <div class="quick-tiles">
      <a href="#/wardrobe" class="quick-tile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>
        <span class="quick-tile-label">Wardrobe</span>
      </a>
      <a href="#/suggest" class="quick-tile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <span class="quick-tile-label">Suggest</span>
      </a>
      <a href="#/calendar" class="quick-tile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span class="quick-tile-label">Plan</span>
      </a>
      <a href="#/stats" class="quick-tile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        <span class="quick-tile-label">Stats</span>
      </a>
    </div>

    <!-- Wardrobe count row -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-card-icon">👕</div>
        <div class="stat-card-value">${cats.top}</div>
        <div class="stat-card-label">Tops</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">👖</div>
        <div class="stat-card-value">${cats.bottom}</div>
        <div class="stat-card-label">Bottoms</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">🧥</div>
        <div class="stat-card-value">${cats.outerwear}</div>
        <div class="stat-card-label">Outerwear</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">👟</div>
        <div class="stat-card-value">${cats.shoes}</div>
        <div class="stat-card-label">Shoes</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">👜</div>
        <div class="stat-card-value">${cats.accessory}</div>
        <div class="stat-card-label">Accessories</div>
      </div>
    </div>

    <!-- Outfit inspiration -->
    ${ranked.length > 0 ? `
    <div class="outfit-inspiration">
      <div class="outfit-inspiration-header">
        <span class="outfit-inspiration-title">Outfit inspiration</span>
        <button class="btn btn-sm btn-secondary" id="shuffle-btn">Shuffle</button>
      </div>
      <div class="outfit-items-row" id="outfit-chips">
        ${ranked.map(({ item }) => `
          <div class="outfit-item-chip">
            <div class="outfit-item-chip-thumb">
              ${item.imageUri ? `<img src="${esc(item.imageUri)}" alt="">` : `<span>${CATEGORY_EMOJI[item.category] || '📦'}</span>`}
            </div>
            <span class="outfit-item-chip-name">${esc(item.name)}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : items.length === 0 ? `
    <div class="section-card" style="text-align:center;padding:32px">
      <p style="font-size:15px;margin-bottom:14px;color:var(--text-secondary)">Your wardrobe is empty — add your first item to get started.</p>
      <a href="#/wardrobe/add" class="btn btn-primary">Add first item</a>
    </div>
    ` : ''}

    <!-- Most worn -->
    ${mostWorn.length > 0 ? `
    <div class="section-card">
      <div class="section-card-title">Most worn</div>
      <div class="worn-list">
        ${mostWorn.map((item, i) => `
          <div class="worn-item-row">
            <span class="worn-item-rank">${i + 1}</span>
            <div class="worn-item-info">
              <div class="worn-item-name">${esc(item.name)}</div>
              <div class="worn-item-cat">${esc(item.category)}</div>
            </div>
            <span class="worn-item-count">${item.usage}×</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Saved outfits preview -->
    ${savedOutfits.length > 0 ? `
    <div class="section-card">
      <div class="section-card-title">Saved outfits</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${savedOutfits.slice(0,4).map(o => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:14px;font-weight:600;color:var(--text-primary)">${esc(o.name)}</span>
            <span class="tag">${o.itemIds.length} items</span>
          </div>
        `).join('')}
      </div>
      <a href="#/saved-outfits" class="btn btn-ghost btn-sm" style="margin-top:10px">View all saved outfits →</a>
    </div>
    ` : ''}
  `;

  container.appendChild(wrap);

  // Shuffle
  const shuffleBtn = wrap.querySelector('#shuffle-btn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      window.location.hash = '#/';
    });
  }
}