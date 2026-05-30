// pages/suggest.js

import * as store from '../store.js';
import * as engine from '../engine.js';
import { resolveImageUri } from '../tauri-fs.js';

function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

const CATEGORY_EMOJI = { top:'👕', bottom:'👖', outerwear:'🧥', shoes:'👟', accessory:'👜' };
const OCCASIONS = ['casual', 'work', 'formal'];

export function renderSuggest(container) {
  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';

  wrap.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Suggest outfit</h1>
        <p class="page-subtitle">Weather-based recommendations from your wardrobe</p>
      </div>
    </div>

    <div class="suggest-tips">
      <strong>Better suggestions:</strong> add weather tags to items, set warmth levels, and include country in city name (e.g. <em>Lyon France</em>).
    </div>

    <div class="section-card">
      <div class="form-group" style="margin-bottom:12px">
        <label class="form-label" for="city-input">Your city</label>
        <div style="display:flex;gap:10px;align-items:flex-start">
          <input type="text" id="city-input" placeholder="e.g. Pittsburgh PA or Paris France" style="flex:1;margin-bottom:0">
          <button class="btn btn-primary" id="suggest-btn">Get suggestions</button>
        </div>
        <div class="field-error" id="city-error" style="display:none"></div>
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label">Occasion</label>
        <div class="occasion-toggle" id="occasion-toggle">
          ${OCCASIONS.map((o, i) => `
            <button class="occasion-btn${i === 0 ? ' active' : ''}" data-occasion="${o}">${o.charAt(0).toUpperCase() + o.slice(1)}</button>
          `).join('')}
        </div>
      </div>
    </div>

    <div id="results"></div>
  `;

  container.appendChild(wrap);

  const cityInput = wrap.querySelector('#city-input');
  const suggestBtn = wrap.querySelector('#suggest-btn');
  const cityError = wrap.querySelector('#city-error');
  const results = wrap.querySelector('#results');
  const occasionBtns = wrap.querySelectorAll('.occasion-btn');

  let currentOccasion = 'casual';
  let lastSuggestion = null;
  let lastItems = null;

  // Occasion toggle
  occasionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      occasionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentOccasion = btn.dataset.occasion;
      if (lastSuggestion && lastItems) {
        renderResults(lastSuggestion, lastItems);
      }
    });
  });

  cityInput.addEventListener('keydown', e => { if (e.key === 'Enter') suggestBtn.click(); });

  suggestBtn.addEventListener('click', async () => {
    cityError.style.display = 'none';
    results.innerHTML = '';
    lastSuggestion = null;
    lastItems = null;

    const city = cityInput.value.trim();
    if (!city) {
      cityError.textContent = 'Please enter a city name.';
      cityError.style.display = 'block';
      return;
    }

    suggestBtn.disabled = true;
    results.innerHTML = `<div class="loading-row"><div class="spinner"></div><span>Fetching weather for ${esc(city)}...</span></div>`;

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

    try {
      // Geocode
      let geoRes, geoData;
      try {
        geoRes = await fetchWithRetry(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
          { headers: { 'User-Agent': 'Attyre/3.0.0 (attyre.org)' } }
        );
        geoData = await geoRes.json();
      } catch (geoErr) {
        throw new Error(`Geocoding service unavailable. If you're offline or blocking third-party APIs, the suggestion will not work. Error: ${geoErr.message}`);
      }

      if (!geoData?.length) {
        results.innerHTML = '';
        cityError.textContent = `City not found - try adding the country, e.g. "Lyon France".`;
        cityError.style.display = 'block';
        suggestBtn.disabled = false;
        return;
      }

      const { lat, lon, display_name } = geoData[0];

      // Weather - fetch temperature, wind speed, and weather code
      let wxRes, wxData;
      try {
        wxRes = await fetchWithRetry(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,windspeed_10m,weathercode`
        );
        wxData = await wxRes.json();
      } catch (wxErr) {
        throw new Error(`Weather service unavailable. Please check your connection and try again. Error: ${wxErr.message}`);
      }

      const current = wxData.current ?? wxData.current_weather;
      const tempC = current?.temperature_2m ?? current?.temperature;
      if (typeof tempC !== 'number') throw new Error('Invalid weather data received.');

      const windspeedKph = current?.windspeed_10m ?? current?.windspeed ?? 0;
      const weatherCode = current?.weathercode ?? null;

      const suggestion = engine.suggestForWeather({ tempC, windspeedKph, weatherCode });
      lastSuggestion = { suggestion, tempC, windspeedKph, displayName: display_name };
      lastItems = store.getItems();

      renderWeatherCard(results, tempC, windspeedKph, suggestion, display_name);

      if (lastItems.length === 0) {
        results.innerHTML += `
          <div class="section-card" style="text-align:center;padding:32px">
            <p style="margin-bottom:14px">Your wardrobe is empty - add items to get outfit suggestions.</p>
            <a href="#/wardrobe/add" class="btn btn-primary">Add an item</a>
          </div>`;
        suggestBtn.disabled = false;
        return;
      }

      renderResults(lastSuggestion, lastItems);
      suggestBtn.disabled = false;
    } catch (err) {
      console.error('Suggestion error:', err);
      results.innerHTML = '';
      cityError.textContent = err.message || 'Failed to fetch weather. Check your connection and try again.';
      cityError.style.display = 'block';
      suggestBtn.disabled = false;
    }
  });

  function renderWeatherCard(container, tempC, windspeedKph, suggestion, displayName) {
    const tempF = Math.round(tempC * 9 / 5 + 32);
    const feelsLike = suggestion.feelsLike ?? tempC;
    const feelsLikeF = Math.round(feelsLike * 9 / 5 + 32);
    const showFeels = Math.abs(feelsLike - tempC) >= 1;

    container.innerHTML = `
      <div class="weather-card">
        <div style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap">
          <div>
            <div class="weather-temp">${tempF}°F</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:2px">${tempC}°C${showFeels ? ` (feels ${feelsLikeF}°F)` : ''}</div>
          </div>
          <div>
            <div class="weather-condition">${esc(suggestion.reason)}</div>
            <div class="weather-city">${esc(displayName.split(',').slice(0,2).join(','))}</div>
          </div>
          ${windspeedKph > 0 ? `<div style="font-size:13px;color:var(--text-muted)">${Math.round(windspeedKph)} km/h wind</div>` : ''}
        </div>
      </div>
    `;
  }

  function renderResults(weatherData, items) {
    const existingCard = results.querySelector('.weather-card');
    const weatherHtml = existingCard ? existingCard.outerHTML : '';

    const today = new Date().toISOString().slice(0, 10);
    const ranked = engine.rankItems(items, weatherData.suggestion, { occasion: currentOccasion, today });

    // Remove old suggestion list, keep weather card
    const oldList = results.querySelector('.suggestion-list');
    const oldTitle = results.querySelector('.section-card-title');
    const oldAlert = results.querySelector('.alert');
    if (oldList) oldList.remove();
    if (oldTitle) oldTitle.remove();
    if (oldAlert) oldAlert.remove();

    if (ranked.length === 0) {
      results.insertAdjacentHTML('beforeend', `
        <div class="alert alert-info">
          No strong matches for today's weather. Try adding weather tags to your wardrobe items.
        </div>`);
      return;
    }

    const listHtml = ranked.map(({ item, score }) => `
      <div class="suggestion-item" data-id="${esc(item.id)}">
        <div class="suggestion-thumb">
          ${item.imageUri ? `<img src="${esc(resolveImageUri(item.imageUri))}" alt="">` : `<span style="font-size:24px">${CATEGORY_EMOJI[item.category] || '📦'}</span>`}
        </div>
        <div class="suggestion-info">
          <div class="suggestion-name">${esc(item.name)}</div>
          <div class="suggestion-meta">${item.color ? esc(item.color) + ' · ' : ''}${esc(item.category)}${item.laundryStatus === 'dirty' ? ' · <span style="color:var(--warning)">needs wash</span>' : ''}</div>
        </div>
        <span class="suggestion-score">${score} pt${score !== 1 ? 's' : ''}</span>
      </div>
    `).join('');

    results.insertAdjacentHTML('beforeend', `
      <div class="section-card-title" style="margin-bottom:10px">Recommended items</div>
      <div class="suggestion-list">${listHtml}</div>
    `);

    results.querySelectorAll('.suggestion-item').forEach(el => {
      el.addEventListener('click', () => { window.location.hash = `#/wardrobe/${el.dataset.id}`; });
    });
  }
}
