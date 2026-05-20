// pages/wardrobe.js

import * as store from '../store.js';
import { renderItemCard } from '../components/item-card.js';
import { announceToScreenReader } from '../app.js';

const ALL_WEATHER_TAGS = ['sunny','cloudy','rain','light-rain','heavy-rain','snow','wind','humid','foggy','cold','hot'];

export function renderWardrobe(container) {
  try {
    _renderWardrobe(container);
  } catch (err) {
    console.error('renderWardrobe failed:', err);
    container.innerHTML = `<div class="page-wrap"><div class="alert alert-warning" style="margin-top:2rem"><span class="alert-icon">⚠</span><span>Wardrobe failed to load. <a href="#/">Go home</a></span></div></div>`;
  }
}

function _renderWardrobe(container) {
  const items = store.getItems();
  const sorted = [...items].reverse();

  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';

  wrap.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Wardrobe</h1>
        <p class="page-subtitle">${items.length} item${items.length !== 1 ? 's' : ''}</p>
      </div>
      <a href="#/wardrobe/add" class="btn btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add item
      </a>
    </div>

    ${items.length > 0 ? `
    <div class="filter-bar">
      <input type="text" id="search" placeholder="Search by name, color…" style="flex:1;min-width:160px">
      <select id="cat-filter">
        <option value="">All categories</option>
        <option value="top">Tops</option>
        <option value="bottom">Bottoms</option>
        <option value="outerwear">Outerwear</option>
        <option value="shoes">Shoes</option>
        <option value="accessory">Accessories</option>
      </select>
      <select id="season-filter">
        <option value="">All seasons</option>
        <option value="spring">Spring</option>
        <option value="summer">Summer</option>
        <option value="fall">Fall</option>
        <option value="winter">Winter</option>
      </select>
    </div>

    <!-- Tag filter chips -->
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px" id="tag-filters">
      ${ALL_WEATHER_TAGS.map(t => `
        <button class="tag-filter-chip tag" data-tag="${t}" style="cursor:pointer;border:1px solid var(--border);background:var(--bg-subtle);padding:4px 10px;font-size:12px;border-radius:20px;font-weight:600;transition:all 0.15s">${t}</button>
      `).join('')}
    </div>
    ` : ''}

    <div id="items-area"></div>
  `;

  container.appendChild(wrap);

  const area = wrap.querySelector('#items-area');

  if (items.length === 0) {
    area.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>
        </div>
        <h2>Your wardrobe is empty</h2>
        <p>Start by adding your first clothing item.</p>
        <a href="#/wardrobe/add" class="btn btn-primary">Add your first item</a>
      </div>
    `;
    return;
  }

  // Active tag filters
  let activeTags = new Set();

  const search = wrap.querySelector('#search');
  const catFilter = wrap.querySelector('#cat-filter');
  const seasonFilter = wrap.querySelector('#season-filter');
  const tagChips = wrap.querySelectorAll('.tag-filter-chip');

  function renderItems() {
    const q = search.value.toLowerCase();
    const cat = catFilter.value;
    const season = seasonFilter.value;

    const filtered = sorted.filter(item => {
      const matchQ = !q || item.name.toLowerCase().includes(q) || (item.color && item.color.toLowerCase().includes(q));
      const matchCat = !cat || item.category === cat;
      const matchSeason = !season || (item.seasons && item.seasons.includes(season));
      const matchTags = activeTags.size === 0 || [...activeTags].every(t => item.weatherTags && item.weatherTags.includes(t));
      return matchQ && matchCat && matchSeason && matchTags;
    });

    area.innerHTML = '';

    if (filtered.length === 0) {
      area.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:32px 0;font-size:14px">No items match your filters.</p>`;
      announceToScreenReader('No items match your filters');
      return;
    }
    announceToScreenReader(`${filtered.length} item${filtered.length !== 1 ? 's' : ''} shown`);

    const grid = document.createElement('div');
    grid.className = 'item-grid';

    for (const item of filtered) {
      const card = renderItemCard(item);
      card.addEventListener('click', () => { window.location.hash = `#/wardrobe/${item.id}`; });
      grid.appendChild(card);
    }

    area.appendChild(grid);
  }

  // Tag chip toggle
  tagChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const t = chip.dataset.tag;
      if (activeTags.has(t)) {
        activeTags.delete(t);
        chip.style.background = 'var(--bg-subtle)';
        chip.style.borderColor = 'var(--border)';
        chip.style.color = 'var(--ink-soft)';
      } else {
        activeTags.add(t);
        chip.style.background = 'var(--gold-light)';
        chip.style.borderColor = 'var(--accent)';
        chip.style.color = 'var(--bark)';
      }
      renderItems();
    });
  });

  search.addEventListener('input', renderItems);
  catFilter.addEventListener('change', renderItems);
  seasonFilter.addEventListener('change', renderItems);

  renderItems();
}