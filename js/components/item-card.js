// components/item-card.js

const CATEGORY_ICON = {
  top:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>`,
  bottom:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v6l-4 12H7L3 9z"/><line x1="12" y1="9" x2="12" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/></svg>`,
  outerwear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/><path d="M10 2v3M14 2v3"/></svg>`,
  shoes:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h20v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2z"/><path d="M2 18l4-10h6l2 4 4-1 2 7"/></svg>`,
  accessory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14"/></svg>`,
};

const CATEGORY_EMOJI = { top: '👕', bottom: '👖', outerwear: '🧥', shoes: '👟', accessory: '👜' };

function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

export function renderItemCard(item) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'item-card';

  const thumb = item.imageUri
    ? `<img src="${item.imageUri}" alt="${esc(item.name)}">`
    : `<span style="color:var(--border-strong)">${CATEGORY_ICON[item.category] || ''}<style>.item-card-thumb svg{width:36px;height:36px}</style></span>`;

  card.innerHTML = `
    <div class="item-card-thumb">${thumb}</div>
    <div class="item-card-body">
      <div class="item-card-name">${esc(item.name)}</div>
      <div class="item-card-meta">
        <span class="tag">${esc(item.category)}</span>
        ${item.color ? `<span class="tag">${esc(item.color)}</span>` : ''}
      </div>
    </div>
  `;

  return card;
}

export { CATEGORY_EMOJI, CATEGORY_ICON };