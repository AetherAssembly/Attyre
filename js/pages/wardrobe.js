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
    container.innerHTML = `<div class="page-wrap"><div class="alert alert-warning" style="margin-top:2rem"><span class="alert-icon">&#9888;</span><span>Wardrobe failed to load. <a href="#/">Go home</a></span></div></div>`;
  }
}

function applyOrder(items) {
  const order = store.getItemOrder();
  if (!order || !order.length) return [...items].reverse();
  const map = new Map(items.map(i => [i.id, i]));
  const sorted = order.map(id => map.get(id)).filter(Boolean);
  // append any items not in the saved order (newly added)
  for (const item of items) {
    if (!order.includes(item.id)) sorted.unshift(item);
  }
  return sorted;
}

function _renderWardrobe(container) {
  const items = store.getItems();
  let ordered = applyOrder(items);

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
      <input type="text" id="search" placeholder="Search by name, color..." style="flex:1;min-width:160px">
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

    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px" id="tag-filters">
      <button class="tag-filter-chip tag" data-special="needs-wash">needs wash</button>
      ${ALL_WEATHER_TAGS.map(t => `
        <button class="tag-filter-chip tag" data-tag="${t}">${t}</button>
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

  let activeTags = new Set();
  let filterNeedsWash = false;

  const search = wrap.querySelector('#search');
  const catFilter = wrap.querySelector('#cat-filter');
  const seasonFilter = wrap.querySelector('#season-filter');
  const tagChips = wrap.querySelectorAll('.tag-filter-chip[data-tag]');
  const washChip = wrap.querySelector('.tag-filter-chip[data-special="needs-wash"]');

  let dragSrcIndex = null;

  function isFiltered() {
    return search.value.trim() || catFilter.value || seasonFilter.value || activeTags.size > 0 || filterNeedsWash;
  }

  function renderItems() {
    const q = search.value.toLowerCase();
    const cat = catFilter.value;
    const season = seasonFilter.value;
    const filtered_mode = isFiltered();

    const filtered = ordered.filter(item => {
      const matchQ = !q || item.name.toLowerCase().includes(q) || (item.color && item.color.toLowerCase().includes(q));
      const matchCat = !cat || item.category === cat;
      const matchSeason = !season || (item.seasons && item.seasons.includes(season));
      const matchTags = activeTags.size === 0 || [...activeTags].every(t => item.weatherTags && item.weatherTags.includes(t));
      const matchWash = !filterNeedsWash || item.laundryStatus === 'dirty';
      return matchQ && matchCat && matchSeason && matchTags && matchWash;
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

    if (!filtered_mode) {
      // Drag-and-drop only when no filters are active
      grid.dataset.draggable = 'true';
    }

    for (let i = 0; i < filtered.length; i++) {
      const item = filtered[i];
      const card = renderItemCard(item);
      card.dataset.id = item.id;
      card.dataset.index = i;
      card.addEventListener('click', () => { window.location.hash = `#/wardrobe/${item.id}`; });

      if (!filtered_mode) {
        card.draggable = true;

        card.addEventListener('dragstart', e => {
          dragSrcIndex = i;
          card.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
          grid.querySelectorAll('.item-card').forEach(c => c.classList.remove('drag-over'));
        });

        card.addEventListener('dragover', e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          grid.querySelectorAll('.item-card').forEach(c => c.classList.remove('drag-over'));
          if (dragSrcIndex !== i) card.classList.add('drag-over');
        });

        card.addEventListener('dragleave', () => {
          card.classList.remove('drag-over');
        });

        card.addEventListener('drop', e => {
          e.preventDefault();
          card.classList.remove('drag-over');
          if (dragSrcIndex === null || dragSrcIndex === i) return;

          // Reorder in the ordered array
          const srcId = filtered[dragSrcIndex].id;
          const srcOrderIdx = ordered.findIndex(it => it.id === srcId);
          const dstOrderIdx = ordered.findIndex(it => it.id === item.id);
          if (srcOrderIdx === -1 || dstOrderIdx === -1) return;

          const moved = ordered.splice(srcOrderIdx, 1)[0];
          ordered.splice(dstOrderIdx, 0, moved);
          store.saveItemOrder(ordered.map(it => it.id));
          dragSrcIndex = null;
          renderItems();
        });
      }

      grid.appendChild(card);
    }

    area.appendChild(grid);
  }

  // "Needs wash" chip toggle
  washChip.addEventListener('click', () => {
    filterNeedsWash = !filterNeedsWash;
    washChip.classList.toggle('chip-active', filterNeedsWash);
    renderItems();
  });

  // Weather tag chip toggle
  tagChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const t = chip.dataset.tag;
      if (activeTags.has(t)) {
        activeTags.delete(t);
        chip.classList.remove('chip-active');
      } else {
        activeTags.add(t);
        chip.classList.add('chip-active');
      }
      renderItems();
    });
  });

  search.addEventListener('input', renderItems);
  catFilter.addEventListener('change', renderItems);
  seasonFilter.addEventListener('change', renderItems);

  renderItems();
}
