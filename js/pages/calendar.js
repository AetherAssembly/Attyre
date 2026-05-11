// pages/calendar.js

import * as store from '../store.js';
import { renderItemCard } from '../components/item-card.js';
import { announceToScreenReader } from '../app.js';

function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function renderCalendar(container) {
  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';

  wrap.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Plan outfit</h1>
        <p class="page-subtitle">Tap a day to assign an outfit</p>
      </div>
    </div>
    <div id="cal-root"></div>
    <div id="outfit-panel" style="margin-top:20px"></div>
  `;

  container.appendChild(wrap);

  const calRoot = wrap.querySelector('#cal-root');
  const outfitPanel = wrap.querySelector('#outfit-panel');

  let viewDate = new Date();
  viewDate.setDate(1);
  let selectedDateStr = toDateStr(new Date());

  function renderCalGrid() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = toDateStr(new Date());
    const outfitDates = store.getOutfitDates();

    let html = `
      <div class="section-card" style="padding:16px">
        <div class="calendar-nav">
          <button class="btn btn-icon" id="prev-month" aria-label="Previous month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span class="calendar-month-label">${MONTHS[month]} ${year}</span>
          <button class="btn btn-icon" id="next-month" aria-label="Next month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div class="calendar-grid" role="grid" aria-label="${MONTHS[month]} ${year}">
          ${WEEKDAYS.map(d => `<div class="calendar-day-header" role="columnheader" aria-label="${d}">${d}</div>`).join('')}
          ${Array(firstDay).fill(0).map(() => `<div class="calendar-day other-month" role="gridcell" aria-hidden="true"></div>`).join('')}
          ${Array.from({length: daysInMonth}, (_, i) => {
            const d = i + 1;
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDateStr;
            const hasOutfit = !!outfitDates[dateStr];
            let cls = 'calendar-day';
            if (isToday) cls += ' today';
            if (isSelected) cls += ' selected';
            if (hasOutfit) cls += ' has-outfit';
            const label = `${MONTHS[month]} ${d}, ${year}${hasOutfit ? ', outfit planned' : ''}`;
            return `<div class="${cls}" role="gridcell" tabindex="0" data-date="${dateStr}" aria-selected="${isSelected}" aria-label="${label}">${d}</div>`;
          }).join('')}
        </div>
      </div>
    `;

    calRoot.innerHTML = html;

    calRoot.querySelector('#prev-month').addEventListener('click', () => {
      viewDate.setMonth(viewDate.getMonth() - 1);
      renderCalGrid();
      renderOutfitPanel();
    });

    calRoot.querySelector('#next-month').addEventListener('click', () => {
      viewDate.setMonth(viewDate.getMonth() + 1);
      renderCalGrid();
      renderOutfitPanel();
    });

    calRoot.querySelectorAll('.calendar-day[data-date]').forEach(el => {
      el.addEventListener('click', () => {
        selectedDateStr = el.dataset.date;
        renderCalGrid();
        renderOutfitPanel();
      });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
      });
    });
  }

  function renderOutfitPanel() {
    const outfitDates = store.getOutfitDates();
    const itemIds = outfitDates[selectedDateStr] || [];
    const allItems = store.getItems();
    const d = new Date(selectedDateStr + 'T12:00:00');
    const dateLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    announceToScreenReader(
      itemIds.length > 0
        ? `${dateLabel}: ${itemIds.length} item outfit planned`
        : `${dateLabel}: no outfit planned`
    );

    if (itemIds.length === 0) {
      outfitPanel.innerHTML = `
        <div class="section-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <span class="section-card-title" style="margin:0">${dateLabel}</span>
          </div>
          <p style="font-size:14px;color:var(--text-muted);margin-bottom:14px">No outfit planned for this day.</p>
          <button class="btn btn-primary" id="select-btn">Choose items</button>
        </div>
      `;
      outfitPanel.querySelector('#select-btn').addEventListener('click', () => showSelector());
    } else {
      const outfitItems = itemIds.map(id => store.getItemById(id)).filter(Boolean);

      outfitPanel.innerHTML = `
        <div class="section-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <span class="section-card-title" style="margin:0">${dateLabel}</span>
            <div class="btn-group">
              <button class="btn btn-sm btn-secondary" id="change-btn">Change</button>
              <button class="btn-icon danger" id="delete-btn" aria-label="Delete outfit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
          <div class="item-grid" id="outfit-items-grid"></div>
        </div>
      `;

      const grid = outfitPanel.querySelector('#outfit-items-grid');
      outfitItems.forEach(item => {
        const card = renderItemCard(item);
        card.addEventListener('click', () => { window.location.hash = `#/wardrobe/${item.id}`; });
        grid.appendChild(card);
      });

      outfitPanel.querySelector('#change-btn').addEventListener('click', () => showSelector());
      outfitPanel.querySelector('#delete-btn').addEventListener('click', () => {
        const dates = store.getOutfitDates();
        delete dates[selectedDateStr];
        localStorage.setItem('attyre_outfit_dates', JSON.stringify(dates));
        renderCalGrid();
        renderOutfitPanel();
      });
    }
  }

  function showSelector() {
    const allItems = store.getItems();
    if (allItems.length === 0) { alert('Your wardrobe is empty — add items first.'); return; }

    const outfitDates = store.getOutfitDates();
    let selected = new Set(outfitDates[selectedDateStr] || []);

    outfitPanel.innerHTML = `
      <div class="section-card">
        <div class="section-card-title">Choose items for this day</div>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px">Tap items to select or deselect them.</p>
        <div class="item-grid" id="selector-grid" style="margin-bottom:16px"></div>
        <div class="btn-group">
          <button class="btn btn-primary" id="save-sel-btn">Save outfit</button>
          <button class="btn btn-secondary" id="cancel-sel-btn">Cancel</button>
        </div>
      </div>
    `;

    const grid = outfitPanel.querySelector('#selector-grid');

    allItems.forEach(item => {
      const card = renderItemCard(item);
      card.style.cursor = 'pointer';
      const isOn = selected.has(item.id);
      card.style.border = isOn ? '2px solid var(--accent)' : '1px solid var(--border)';
      card.style.background = isOn ? 'var(--gold-light)' : '';
      card.setAttribute('aria-pressed', isOn ? 'true' : 'false');

      card.addEventListener('click', () => {
        if (selected.has(item.id)) {
          selected.delete(item.id);
          card.style.border = '1px solid var(--border)';
          card.style.background = '';
          card.setAttribute('aria-pressed', 'false');
        } else {
          selected.add(item.id);
          card.style.border = '2px solid var(--accent)';
          card.style.background = 'var(--gold-light)';
          card.setAttribute('aria-pressed', 'true');
        }
      });

      grid.appendChild(card);
    });

    outfitPanel.querySelector('#save-sel-btn').addEventListener('click', () => {
      if (selected.size === 0) { alert('Select at least one item.'); return; }
      store.saveOutfitDate(selectedDateStr, [...selected]);
      selected.forEach(id => store.incrementItemUsage(id));
      renderCalGrid();
      renderOutfitPanel();
    });

    outfitPanel.querySelector('#cancel-sel-btn').addEventListener('click', renderOutfitPanel);
  }

  renderCalGrid();
  renderOutfitPanel();
}