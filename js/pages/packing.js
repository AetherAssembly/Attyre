// pages/packing.js - Packing list generator

import * as store from '../store.js';
import * as engine from '../engine.js';
import { resolveImageUri } from '../electron-bridge.js';

function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

const OCCASIONS = ['casual', 'work', 'formal'];
const CATEGORY_ORDER = ['top', 'bottom', 'outerwear', 'shoes', 'accessory'];
const CATEGORY_LABEL = { top: 'Tops', bottom: 'Bottoms', outerwear: 'Outerwear', shoes: 'Shoes', accessory: 'Accessories' };
const CATEGORY_EMOJI = { top:'👕', bottom:'👖', outerwear:'🧥', shoes:'👟', accessory:'👜' };

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function datesBetween(from, to) {
  const dates = [];
  const cur = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');
  while (cur <= end) {
    dates.push(isoDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export async function renderPacking(container) {
  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';

  const today = isoDate(new Date());
  const twoWeeks = isoDate(new Date(Date.now() + 13 * 86400000));

  wrap.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pack</h1>
        <p class="page-subtitle">Generate a packing list from your wardrobe</p>
      </div>
    </div>

    <div class="section-card">
      <div class="form-group">
        <label class="form-label" for="pack-city">Destination city</label>
        <div style="display:flex;gap:10px;align-items:flex-start">
          <input type="text" id="pack-city" placeholder="e.g. Tokyo Japan" style="flex:1;margin-bottom:0">
        </div>
        <div class="field-error" id="pack-city-error" style="display:none"></div>
      </div>
      <div style="display:flex;gap:14px;flex-wrap:wrap">
        <div class="form-group" style="flex:1;min-width:130px;margin-bottom:0">
          <label class="form-label" for="pack-from">Departure</label>
          <input type="date" id="pack-from" value="${esc(today)}" min="${esc(today)}">
        </div>
        <div class="form-group" style="flex:1;min-width:130px;margin-bottom:0">
          <label class="form-label" for="pack-to">Return</label>
          <input type="date" id="pack-to" value="${esc(twoWeeks)}" min="${esc(today)}">
        </div>
      </div>
      <div class="form-group" style="margin-top:14px;margin-bottom:0">
        <label class="form-label">Occasion</label>
        <div class="occasion-toggle" id="pack-occasion-toggle">
          ${OCCASIONS.map((o, i) => `
            <button class="occasion-btn${i === 0 ? ' active' : ''}" data-occasion="${o}">${o.charAt(0).toUpperCase() + o.slice(1)}</button>
          `).join('')}
        </div>
      </div>
      <div style="margin-top:16px">
        <button class="btn btn-primary" id="pack-btn">Generate list</button>
      </div>
    </div>

    <div id="pack-results"></div>
  `;

  container.appendChild(wrap);

  const cityInput = wrap.querySelector('#pack-city');
  const fromInput = wrap.querySelector('#pack-from');
  const toInput = wrap.querySelector('#pack-to');
  const packBtn = wrap.querySelector('#pack-btn');
  const cityError = wrap.querySelector('#pack-city-error');
  const results = wrap.querySelector('#pack-results');
  const occasionBtns = wrap.querySelectorAll('.occasion-btn');

  let currentOccasion = 'casual';

  occasionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      occasionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentOccasion = btn.dataset.occasion;
    });
  });

  // Keep "to" date at least equal to "from"
  fromInput.addEventListener('change', () => {
    if (toInput.value < fromInput.value) toInput.value = fromInput.value;
  });

  async function fetchWithRetry(url, opts = {}, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      try {
        const r = await fetch(url, opts);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r;
      } catch (e) {
        if (i === retries) throw e;
        await new Promise(r => setTimeout(r, 800 * (i + 1)));
      }
    }
  }

  packBtn.addEventListener('click', async () => {
    cityError.style.display = 'none';
    results.innerHTML = '';

    const city = cityInput.value.trim();
    const fromDate = fromInput.value;
    const toDate = toInput.value;

    if (!city) {
      cityError.textContent = 'Please enter a destination city.';
      cityError.style.display = 'block';
      return;
    }
    if (!fromDate || !toDate || toDate < fromDate) {
      cityError.textContent = 'Please select a valid date range.';
      cityError.style.display = 'block';
      return;
    }

    const days = datesBetween(fromDate, toDate);
    if (days.length > 14) {
      cityError.textContent = 'Date range must be 14 days or fewer.';
      cityError.style.display = 'block';
      return;
    }

    packBtn.disabled = true;
    results.innerHTML = `<div class="loading-row"><div class="spinner"></div><span>Fetching forecast for ${esc(city)}...</span></div>`;

    try {
      // Geocode
      const geoRes = await fetchWithRetry(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'Attyre/4.2.0 (github.com/AetherAssembly/Attyre)' } }
      );
      const geoData = await geoRes.json();

      if (!geoData?.length) {
        results.innerHTML = '';
        cityError.textContent = `City not found - try adding the country, e.g. "Bangkok Thailand".`;
        cityError.style.display = 'block';
        packBtn.disabled = false;
        return;
      }

      const { lat, lon, display_name } = geoData[0];

      // Multi-day forecast (up to 16 days from Open-Meteo)
      const wxRes = await fetchWithRetry(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max` +
        `&timezone=auto&forecast_days=${days.length}`
      );
      const wxData = await wxRes.json();

      const daily = wxData.daily;
      if (!daily?.time?.length) throw new Error('Invalid forecast data received.');

      // Build per-day weather lookup
      const dayWeather = new Map();
      for (let i = 0; i < daily.time.length; i++) {
        const date = daily.time[i];
        if (days.includes(date)) {
          dayWeather.set(date, {
            tempC: (daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2,
            windspeedKph: daily.windspeed_10m_max?.[i] ?? 0,
            weatherCode: daily.weathercode?.[i] ?? null,
          });
        }
      }

      const items = await store.getItems();
      if (items.length === 0) {
        results.innerHTML = `
          <div class="section-card" style="text-align:center;padding:32px">
            <p style="margin-bottom:14px">Your wardrobe is empty - add items to get packing suggestions.</p>
            <a href="#/wardrobe/add" class="btn btn-primary">Add an item</a>
          </div>`;
        packBtn.disabled = false;
        return;
      }

      // Run suggestions per day, collect unique recommended item IDs
      const itemScoreMap = new Map(); // id -> max score seen
      for (const date of days) {
        const wx = dayWeather.get(date);
        if (!wx) continue;
        const suggestion = engine.suggestForWeather(wx);
        const ranked = engine.rankItems(items, suggestion, { occasion: currentOccasion });
        for (const { item, score } of ranked) {
          const prev = itemScoreMap.get(item.id) ?? 0;
          if (score > prev) itemScoreMap.set(item.id, score);
        }
      }

      if (itemScoreMap.size === 0) {
        results.innerHTML = `
          <div class="alert alert-info">
            No strong wardrobe matches for this trip. Try adding weather tags to your items.
          </div>`;
        packBtn.disabled = false;
        return;
      }

      // Fetch temp range for display
      const tempsC = [...dayWeather.values()].map(w => w.tempC);
      const minC = Math.round(Math.min(...tempsC));
      const maxC = Math.round(Math.max(...tempsC));
      const minF = Math.round(minC * 9 / 5 + 32);
      const maxF = Math.round(maxC * 9 / 5 + 32);

      // Group recommended items by category
      const itemMap = new Map(items.map(i => [i.id, i]));
      const byCategory = new Map();
      for (const [id] of itemScoreMap) {
        const item = itemMap.get(id);
        if (!item) continue;
        if (!byCategory.has(item.category)) byCategory.set(item.category, []);
        byCategory.get(item.category).push(item);
      }

      const locationShort = esc(display_name.split(',').slice(0, 2).join(','));
      const dayCount = days.length;

      let html = `
        <div class="weather-card">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
            <div>
              <div class="weather-temp">${minF}-${maxF}°F</div>
              <div style="font-size:13px;color:var(--text-muted);margin-top:2px">${minC}-${maxC}°C</div>
            </div>
            <div>
              <div class="weather-condition">${dayCount}-day trip</div>
              <div class="weather-city">${locationShort}</div>
            </div>
          </div>
        </div>
        <div class="section-card-title" style="margin-bottom:12px">Packing list</div>
        <div class="pack-list">
      `;

      for (const cat of CATEGORY_ORDER) {
        const catItems = byCategory.get(cat);
        if (!catItems?.length) continue;

        html += `
          <div class="pack-category">
            <div class="pack-category-label">${CATEGORY_EMOJI[cat]} ${esc(CATEGORY_LABEL[cat])}</div>
        `;

        for (const item of catItems) {
          const dirty = item.laundryStatus === 'dirty';
          html += `
            <label class="pack-item">
              <input type="checkbox" class="pack-checkbox" data-id="${esc(item.id)}">
              <div class="pack-item-thumb">
                ${item.imageUri
                  ? `<img src="${esc(resolveImageUri(item.imageUri))}" alt="">`
                  : `<span>${CATEGORY_EMOJI[item.category] || '📦'}</span>`}
              </div>
              <div class="pack-item-info">
                <span class="pack-item-name">${esc(item.name)}</span>
                ${item.color ? `<span class="pack-item-color">${esc(item.color)}</span>` : ''}
                ${dirty ? `<span class="laundry-badge">wash</span>` : ''}
              </div>
            </label>
          `;
        }

        html += `</div>`;
      }

      html += `</div>`;

      results.innerHTML = html;

      // Check-off items as packed
      results.querySelectorAll('.pack-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
          const label = cb.closest('.pack-item');
          label.classList.toggle('pack-item--checked', cb.checked);
        });
      });

      packBtn.disabled = false;
    } catch (err) {
      console.error('Packing error:', err);
      results.innerHTML = '';
      cityError.textContent = err.message || 'Failed to fetch forecast. Check your connection and try again.';
      cityError.style.display = 'block';
      packBtn.disabled = false;
    }
  });
}
