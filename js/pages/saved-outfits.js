// pages/saved-outfits.js - Saved outfits page

import * as store from '../store.js';
import { renderItemCard } from '../components/item-card.js';

function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}

export function renderSavedOutfits(container) {
  const outfits = store.getSavedOutfits();

  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';

  wrap.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Saved Outfits</h1>
        <p class="page-subtitle" id="outfits-count">${outfits.length} saved outfit${outfits.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
    ${outfits.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
        </div>
        <h2>No saved outfits yet</h2>
        <p>Combine items together and save them as outfits from the Suggest page.</p>
        <a href="#/suggest" class="btn btn-primary">Get outfit suggestions</a>
      </div>
    ` : '<div id="outfits-list"></div>'}
  `;

  container.appendChild(wrap);

  if (outfits.length > 0) {
    const outfitsList = wrap.querySelector('#outfits-list');

    for (const outfit of outfits) {
      const outfitEl = document.createElement('div');
      outfitEl.className = 'outfit-section';

      const outfitItems = outfit.itemIds.map(id => store.getItemById(id)).filter(Boolean);

      outfitEl.innerHTML = `
        <div class="outfit-section-header">
          <span class="outfit-section-name">${esc(outfit.name)}</span>
          <div class="btn-group">
            <span class="tag">${outfitItems.length} item${outfitItems.length !== 1 ? 's' : ''}</span>
            <button class="btn-icon danger delete-outfit-btn" aria-label="Delete outfit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </div>
        <div class="outfit-section-body item-grid"></div>
      `;

      const itemsGrid = outfitEl.querySelector('.outfit-section-body');
      for (const item of outfitItems) {
        const card = renderItemCard(item);
        card.addEventListener('click', () => { window.location.hash = `#/wardrobe/${item.id}`; });
        itemsGrid.appendChild(card);
      }

      const deleteBtn = outfitEl.querySelector('.delete-outfit-btn');
      deleteBtn.addEventListener('click', () => {
        store.deleteSavedOutfit(outfit.id);
        outfitEl.remove();
        const remaining = wrap.querySelectorAll('.outfit-section').length;
        const countEl = wrap.querySelector('#outfits-count');
        if (countEl) countEl.textContent = `${remaining} saved outfit${remaining !== 1 ? 's' : ''}`;
        if (remaining === 0) window.location.hash = '#/saved-outfits';
      });

      outfitsList.appendChild(outfitEl);
    }
  }
}
