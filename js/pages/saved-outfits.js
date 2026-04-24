// pages/saved-outfits.js - Saved outfits page

import * as store from '../store.js';
import { renderItemCard } from '../components/item-card.js';

export function renderSavedOutfits(container) {
  const outfits = store.getSavedOutfits();
  const items = store.getItems();

  const html = `
    <div class="page-container">
      <div class="container">
        <h1>📦 Saved Outfits</h1>
        
        ${outfits.length === 0 ? `
          <div class="empty-state" style="margin-top: 40px;">
            <p style="font-size: 48px; margin-bottom: 16px;">🎨</p>
            <h2>No saved outfits yet</h2>
            <p>Combine items together and save them as outfits to use later.</p>
          </div>
        ` : `
          <div id="outfits-list"></div>
        `}
      </div>
    </div>
  `;

  container.innerHTML = html;

  if (outfits.length > 0) {
    const outfitsList = container.querySelector('#outfits-list');

    for (const outfit of outfits) {
      const outfitEl = document.createElement('div');
      outfitEl.className = 'saved-outfit-section';

      const outfitItems = outfit.itemIds.map(id => store.getItemById(id)).filter(Boolean);

      outfitEl.innerHTML = `
        <div class="saved-outfit-header">
          <h3>${escapeHtml(outfit.name)}</h3>
          <div class="saved-outfit-actions">
            <button class="btn-icon delete-outfit-btn" title="Delete outfit">🗑️</button>
          </div>
        </div>
        <div class="saved-outfit-items-display"></div>
      `;

      const itemsDisplay = outfitEl.querySelector('.saved-outfit-items-display');
      for (const item of outfitItems) {
        const card = renderItemCard(item);
        itemsDisplay.appendChild(card);
      }

      const deleteBtn = outfitEl.querySelector('.delete-outfit-btn');
      deleteBtn.addEventListener('click', () => {
        store.deleteSavedOutfit(outfit.id);
        window.location.hash = '#/saved-outfits';
      });

      outfitsList.appendChild(outfitEl);
    }
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
