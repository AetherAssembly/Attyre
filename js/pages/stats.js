// pages/stats.js

import * as store from '../store.js';

function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

export async function renderStats(container) {
  try {
    await _renderStats(container);
  } catch (err) {
    console.error('renderStats failed:', err);
    container.innerHTML = `<div class="page-wrap"><div class="alert alert-warning" style="margin-top:2rem"><span class="alert-icon">⚠</span><span>Stats failed to load. <a href="#/">Go home</a></span></div></div>`;
  }
}

async function _renderStats(container) {
  const items = await store.getItems();
  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';

  if (items.length === 0) {
    wrap.innerHTML = `
      <div class="page-header"><h1 class="page-title">Stats</h1></div>
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <h2>No data yet</h2>
        <p>Add items to your wardrobe and plan outfits to see stats here.</p>
        <a href="#/wardrobe/add" class="btn btn-primary">Add your first item</a>
      </div>
    `;
    container.appendChild(wrap);
    return;
  }

  // Category breakdown
  const cats = { top: 0, bottom: 0, outerwear: 0, shoes: 0, accessory: 0 };
  const catEmoji = { top: '👕', bottom: '👖', outerwear: '🧥', shoes: '👟', accessory: '👜' };
  items.forEach(i => { if (cats[i.category] !== undefined) cats[i.category]++; });
  const maxCat = Math.max(...Object.values(cats), 1);

  // Season breakdown
  const seasons = { spring: 0, summer: 0, fall: 0, winter: 0 };
  items.forEach(i => (i.seasons || []).forEach(s => { if (seasons[s] !== undefined) seasons[s]++; }));
  const maxSeason = Math.max(...Object.values(seasons), 1);

  // Occasion breakdown
  const occasions = {};
  items.forEach(i => (i.occasions || []).forEach(o => { occasions[o] = (occasions[o] || 0) + 1; }));
  const sortedOcc = Object.entries(occasions).sort((a,b) => b[1]-a[1]);
  const maxOcc = sortedOcc.length ? sortedOcc[0][1] : 1;

  // Warmth distribution
  const warmths = [0,0,0,0,0];
  items.forEach(i => { if (i.warmth >= 1 && i.warmth <= 5) warmths[i.warmth-1]++; });
  const maxWarmth = Math.max(...warmths, 1);

  // Most & least worn
  const worn = items.filter(i => i.usage > 0).sort((a,b) => (b.usage||0)-(a.usage||0));
  const unworn = items.filter(i => !i.usage || i.usage === 0);
  const totalWears = items.reduce((s, i) => s + (i.usage || 0), 0);

  // Planned days
  let plannedDays = 0;
  try {
    const dates = store.getOutfitDates();
    plannedDays = Object.keys(dates).length;
  } catch {}

  const warmthLabel = ['Freezing','Cold','Mild','Warm','Hot'];

  wrap.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Stats</h1>
        <p class="page-subtitle">Insights about your wardrobe</p>
      </div>
    </div>

    <!-- Summary row -->
    <div class="stats-row" style="margin-bottom:24px">
      <div class="stat-card">
        <div class="stat-card-icon">👕</div>
        <div class="stat-card-value">${items.length}</div>
        <div class="stat-card-label">Total items</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">🔁</div>
        <div class="stat-card-value">${totalWears}</div>
        <div class="stat-card-label">Total wears</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">📅</div>
        <div class="stat-card-value">${plannedDays}</div>
        <div class="stat-card-label">Days planned</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">😴</div>
        <div class="stat-card-value">${unworn.length}</div>
        <div class="stat-card-label">Never worn</div>
      </div>
    </div>

    <!-- Category breakdown -->
    <div class="section-card" style="margin-bottom:14px">
      <div class="section-card-title">By category</div>
      <div class="bar-chart">
        ${Object.entries(cats).map(([cat, count]) => `
          <div class="bar-row">
            <span class="bar-label">${catEmoji[cat]} ${cat.charAt(0).toUpperCase()+cat.slice(1)}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/maxCat*100)}%"></div></div>
            <span class="bar-count">${count}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Season breakdown -->
    <div class="section-card" style="margin-bottom:14px">
      <div class="section-card-title">By season</div>
      <div class="bar-chart">
        ${Object.entries(seasons).map(([s, count]) => `
          <div class="bar-row">
            <span class="bar-label">${s.charAt(0).toUpperCase()+s.slice(1)}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/maxSeason*100)}%"></div></div>
            <span class="bar-count">${count}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Warmth distribution -->
    <div class="section-card" style="margin-bottom:14px">
      <div class="section-card-title">Warmth distribution</div>
      <div class="bar-chart">
        ${warmths.map((count, i) => `
          <div class="bar-row">
            <span class="bar-label" style="font-size:12px">${warmthLabel[i]}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/maxWarmth*100)}%"></div></div>
            <span class="bar-count">${count}</span>
          </div>
        `).join('')}
      </div>
    </div>

    ${sortedOcc.length > 0 ? `
    <!-- Occasion breakdown -->
    <div class="section-card" style="margin-bottom:14px">
      <div class="section-card-title">By occasion</div>
      <div class="bar-chart">
        ${sortedOcc.map(([occ, count]) => `
          <div class="bar-row">
            <span class="bar-label">${occ.charAt(0).toUpperCase()+occ.slice(1)}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/maxOcc*100)}%"></div></div>
            <span class="bar-count">${count}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Most worn -->
    ${worn.length > 0 ? `
    <div class="section-card" style="margin-bottom:14px">
      <div class="section-card-title">Most worn items</div>
      <div class="worn-list">
        ${worn.slice(0,10).map((item, i) => `
          <div class="worn-item-row" style="cursor:pointer" data-id="${esc(item.id)}">
            <span class="worn-item-rank">${i+1}</span>
            <div class="worn-item-info">
              <div class="worn-item-name">${esc(item.name)}</div>
              <div class="worn-item-cat">${esc(item.category)}${item.color ? ' · ' + esc(item.color) : ''}</div>
            </div>
            <span class="worn-item-count">${item.usage}×</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Unworn items -->
    ${unworn.length > 0 ? `
    <div class="section-card" style="margin-bottom:14px">
      <div class="section-card-title">Never worn (${unworn.length})</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${unworn.slice(0,20).map(item => `
          <a href="#/wardrobe/${esc(item.id)}" class="tag" style="font-size:13px;padding:5px 11px">${esc(item.name)}</a>
        `).join('')}
        ${unworn.length > 20 ? `<span class="tag" style="font-size:13px;padding:5px 11px">+${unworn.length-20} more</span>` : ''}
      </div>
    </div>
    ` : ''}
  `;

  container.appendChild(wrap);

  // Click worn rows → go to item
  wrap.querySelectorAll('.worn-item-row[data-id]').forEach(row => {
    row.addEventListener('click', () => { window.location.hash = `#/wardrobe/${row.dataset.id}`; });
  });
}