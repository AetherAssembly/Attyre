// pages/history.js - Outfit history timeline

import * as store from '../store.js';
import { resolveImageUri } from '../tauri-fs.js';

function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

const CATEGORY_EMOJI = { top:'👕', bottom:'👖', outerwear:'🧥', shoes:'👟', accessory:'👜' };

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatMonth(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function daysAgo(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((today - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return null;
}

export function renderHistory(container) {
  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';

  const allDates = store.getOutfitDates();
  const today = new Date().toISOString().slice(0, 10);

  // Filter to past dates (up to and including today)
  const pastEntries = Object.entries(allDates)
    .filter(([date]) => date <= today && allDates[date]?.length > 0)
    .sort((a, b) => b[0].localeCompare(a[0])); // newest first

  if (pastEntries.length === 0) {
    wrap.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">History</h1>
          <p class="page-subtitle">Past outfits you've planned</p>
        </div>
      </div>
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
        </div>
        <h2>No outfit history yet</h2>
        <p>Plan outfits on the calendar and they'll appear here after the date passes.</p>
        <a href="#/calendar" class="btn btn-primary">Open calendar</a>
      </div>
    `;
    container.appendChild(wrap);
    return;
  }

  const itemMap = new Map(store.getItems().map(i => [i.id, i]));

  // Group by month
  const byMonth = new Map();
  for (const [date, itemIds] of pastEntries) {
    const month = date.slice(0, 7); // YYYY-MM
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push({ date, itemIds });
  }

  let html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">History</h1>
        <p class="page-subtitle">${pastEntries.length} outfit${pastEntries.length !== 1 ? 's' : ''} planned</p>
      </div>
    </div>
    <div class="history-timeline">
  `;

  for (const [, entries] of byMonth) {
    const monthLabel = formatMonth(entries[0].date);
    html += `<div class="history-month-label">${esc(monthLabel)}</div>`;

    for (const { date, itemIds } of entries) {
      const items = itemIds.map(id => itemMap.get(id)).filter(Boolean);
      const ago = daysAgo(date);

      html += `
        <div class="history-entry" data-date="${esc(date)}">
          <div class="history-entry-header">
            <div>
              <div class="history-entry-date">${esc(formatDate(date))}</div>
              ${ago ? `<div class="history-entry-ago">${esc(ago)}</div>` : ''}
            </div>
            <button class="btn btn-sm history-wear-again" data-date="${esc(date)}" title="Plan this outfit for today">
              Wear again
            </button>
          </div>
          <div class="history-thumbs">
            ${items.map(item => `
              <div class="history-thumb" title="${esc(item.name)}">
                ${item.imageUri
                  ? `<img src="${esc(resolveImageUri(item.imageUri))}" alt="${esc(item.name)}">`
                  : `<span>${CATEGORY_EMOJI[item.category] || '📦'}</span>`}
              </div>
            `).join('')}
            ${items.length === 0 ? '<p style="font-size:13px;color:var(--text-muted)">Items removed from wardrobe</p>' : ''}
          </div>
          ${items.length > 0 ? `
            <div class="history-item-names">
              ${items.map(i => `<span class="tag">${esc(i.name)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }
  }

  html += `</div>`;
  wrap.innerHTML = html;
  container.appendChild(wrap);

  // "Wear again" - pre-fill today's calendar slot with the same item IDs
  wrap.querySelectorAll('.history-wear-again').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const sourceDate = btn.dataset.date;
      const itemIds = allDates[sourceDate];
      if (!itemIds?.length) return;

      store.saveOutfitDate(today, itemIds);
      itemIds.forEach(id => store.incrementItemUsage(id));
      showToast('Outfit copied to today!');
    });
  });
}

function showToast(message) {
  const existing = document.getElementById('toast-container');
  if (!existing) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  existing.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
