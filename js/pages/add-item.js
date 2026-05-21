// pages/add-item.js - Add item form page

import * as store from '../store.js';
import { isTauri, saveImageFile } from '../tauri-fs.js';

const CATEGORIES = ['top', 'bottom', 'outerwear', 'shoes', 'accessory'];
const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const OCCASIONS = ['casual', 'work', 'formal', 'party', 'outdoor', 'sport'];
const WEATHER_TAGS = ['sunny', 'cloudy', 'rain', 'light-rain', 'heavy-rain', 'snow', 'wind', 'humid', 'foggy', 'cold', 'hot'];

const CATEGORY_PREFIX = { top: 'Shirt', bottom: 'Pants', outerwear: 'Jacket', shoes: 'Shoes', accessory: 'Accessory' };

// Tags automatically suggested per warmth level (user can still override)
// 1 = coldest weather → 5 = hottest weather
const WARMTH_TAGS = {
  1: ['cold', 'snow', 'wind'],
  2: ['cold', 'wind'],
  3: ['cloudy'],
  4: ['sunny', 'cloudy'],
  5: ['sunny', 'hot', 'humid'],
};

// Temperature ranges shown on warmth buttons (1 = coldest, 5 = hottest)
const WARMTH_META = {
  1: { label: 'Freezing', range: '≤0°C / ≤32°F' },
  2: { label: 'Cold',     range: '1–10°C / 34–50°F' },
  3: { label: 'Mild',     range: '11–18°C / 52–64°F' },
  4: { label: 'Warm',     range: '19–24°C / 66–75°F' },
  5: { label: 'Hot',      range: '25°C+ / 77°F+' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateAutoName(category) {
  const prefix = CATEGORY_PREFIX[category] || 'Item';
  const count = store.getItems().filter(i => i.category === category).length + 1;
  return `${prefix}_${String(count).padStart(3, '0')}`;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h, s, l];
}

function rgbToColorName(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);
  if (l > 0.9) return 'white';
  if (l < 0.1) return 'black';
  if (s < 0.15) {
    if (l < 0.3) return 'dark grey';
    if (l < 0.6) return 'grey';
    return 'light grey';
  }
  const hue = h * 360;
  if (hue < 15 || hue >= 345) return 'red';
  if (hue < 30)  return 'orange red';
  if (hue < 50)  return 'orange';
  if (hue < 70)  return 'yellow';
  if (hue < 150) return 'green';
  if (hue < 195) return 'teal';
  if (hue < 255) return l < 0.35 ? 'navy' : 'blue';
  if (hue < 285) return 'purple';
  if (hue < 330) return 'pink';
  return 'red';
}

function detectDominantColor(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const SIZE = 50;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
        const buckets = {};
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 128) continue; // skip transparent
          const r = Math.round(data[i]     / 32) * 32;
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;
          const key = `${r},${g},${b}`;
          buckets[key] = (buckets[key] || 0) + 1;
        }
        const top = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0];
        if (!top) { resolve(''); return; }
        const [r, g, b] = top[0].split(',').map(Number);
        resolve(rgbToColorName(r, g, b));
      } catch {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = dataUrl;
  });
}

// ── Render ────────────────────────────────────────────────────────────────────

export function renderAddItem(container) {
  try {
    _renderAddItem(container);
  } catch (err) {
    console.error('renderAddItem failed:', err);
    container.innerHTML = `<div class="page-wrap"><div class="alert alert-warning" style="margin-top:2rem"><span class="alert-icon">⚠</span><span>Add Item failed to load. <a href="#/">Go home</a></span></div></div>`;
  }
}

function _renderAddItem(container) {
  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';

  wrap.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Add Item</h1>
        <p class="page-subtitle">Add a new item to your wardrobe</p>
      </div>
    </div>

    <div class="section-card">
      <form id="add-item-form">

        <!-- 1. Photo (required, first) -->
        <div class="form-group">
          <label class="form-label" for="image">Photo *</label>
          <input type="file" id="image" name="image" accept="image/*" aria-describedby="image-error">
          <p class="field-error" id="image-error" style="display:none"></p>
          <div id="image-preview-container"></div>
        </div>

        <!-- 2. Name (optional, auto-generated) -->
        <div class="form-group">
          <label class="form-label" for="name">Name <span style="font-weight:400;color:var(--text-muted)">(optional)</span></label>
          <input type="text" id="name" name="name" placeholder="Auto-generated from category" aria-describedby="name-error">
          <p class="field-error" id="name-error" style="display:none"></p>
        </div>

        <!-- 3. Category (required, drives auto-name placeholder) -->
        <div class="form-group">
          <label class="form-label" for="category">Category *</label>
          <select id="category" name="category" required aria-describedby="category-error">
            <option value="">Select a category</option>
            ${CATEGORIES.map(cat => `<option value="${cat}">${capitalize(cat)}</option>`).join('')}
          </select>
          <p class="field-error" id="category-error" style="display:none"></p>
        </div>

        <!-- 4. Color (auto-filled from image) -->
        <div class="form-group">
          <label class="form-label" for="color">Color <span style="font-weight:400;color:var(--text-muted)">(auto-detected from photo)</span></label>
          <input type="text" id="color" name="color" placeholder="e.g. navy blue">
        </div>

        <!-- 5. Warmth level with temperature ranges -->
        <div class="form-group">
          <label class="form-label">Warmth Level *</label>
          <div class="warmth-row">
            ${[1, 2, 3, 4, 5].map(level => `
              <button type="button" class="warmth-btn" data-warmth="${level}" aria-label="Warmth ${level}: ${WARMTH_META[level].label}, ${WARMTH_META[level].range}">
                ${level}
                <small>${WARMTH_META[level].label}</small>
                <small style="font-size:10px;opacity:0.75">${WARMTH_META[level].range}</small>
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="warmth" name="warmth" value="">
          <p class="field-error" id="warmth-error" style="display:none"></p>
        </div>

        <!-- 6. Seasons -->
        <div class="form-group">
          <label class="form-label">Seasons</label>
          <div class="checkbox-grid checkbox-grid-2">
            ${SEASONS.map(season => `
              <label class="checkbox-item">
                <input type="checkbox" name="seasons" value="${season}">
                ${capitalize(season)}
              </label>
            `).join('')}
          </div>
        </div>

        <!-- 7. Occasions -->
        <div class="form-group">
          <label class="form-label">Occasions</label>
          <div class="checkbox-grid checkbox-grid-2">
            ${OCCASIONS.map(occasion => `
              <label class="checkbox-item">
                <input type="checkbox" name="occasions" value="${occasion}">
                ${capitalize(occasion)}
              </label>
            `).join('')}
          </div>
        </div>

        <!-- 8. Weather tags (auto-suggested from warmth) -->
        <div class="form-group">
          <label class="form-label">Weather Tags <span style="font-weight:400;color:var(--text-muted)">(suggested from warmth)</span></label>
          <div class="checkbox-grid checkbox-grid-3">
            ${WEATHER_TAGS.map(tag => `
              <label class="checkbox-item">
                <input type="checkbox" name="weatherTags" value="${tag}" data-weather-tag="${tag}">
                ${capitalize(tag.replace('-', ' '))}
              </label>
            `).join('')}
          </div>
        </div>

        <!-- 9. Notes -->
        <div class="form-group">
          <label class="form-label" for="notes">Notes</label>
          <textarea id="notes" name="notes" placeholder="Any additional details..."></textarea>
        </div>

        <div class="btn-stack" style="margin-top:8px">
          <button type="submit" class="btn btn-primary btn-full">Save Item</button>
          <a href="#/wardrobe" class="btn btn-secondary btn-full">Cancel</a>
        </div>
      </form>
    </div>
  `;

  container.appendChild(wrap);
  attachEventListeners(wrap);
}

// ── Event listeners ───────────────────────────────────────────────────────────

function attachEventListeners(wrap) {
  const form           = wrap.querySelector('#add-item-form');
  const nameInput      = wrap.querySelector('#name');
  const categorySelect = wrap.querySelector('#category');
  const colorInput     = wrap.querySelector('#color');
  const warmthInput    = wrap.querySelector('#warmth');
  const warmthButtons  = wrap.querySelectorAll('.warmth-btn');
  const imageInput     = wrap.querySelector('#image');
  const previewContainer = wrap.querySelector('#image-preview-container');

  // Update name placeholder when category changes
  categorySelect.addEventListener('change', () => {
    const cat = categorySelect.value;
    nameInput.placeholder = cat ? generateAutoName(cat) : 'Auto-generated from category';
  });

  // Warmth buttons: select + auto-suggest weather tags
  warmthButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      warmthButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const level = parseInt(btn.dataset.warmth);
      warmthInput.value = level;
      applyWarmthTags(wrap, level);
    });
  });

  // Image: load → preview → detect color
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      showPreview(dataUrl, imageInput, previewContainer);
      // Auto-fill color
      const color = await detectDominantColor(dataUrl);
      if (color && !colorInput.value) colorInput.value = color;
    };
    reader.readAsDataURL(file);
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(wrap);

    const rawImage = imageInput.dataset.base64 || '';
    const category = categorySelect.value;
    const warmth   = parseInt(warmthInput.value);
    const color    = colorInput.value.trim();
    const notes    = form.querySelector('#notes').value.trim();
    let   name     = nameInput.value.trim();

    // Validation
    let valid = true;
    if (!rawImage) { showError('image-error', 'A photo is required'); valid = false; }
    if (!category) { showError('category-error', 'Category is required'); valid = false; }
    if (!warmth)   { showError('warmth-error', 'Please select a warmth level'); valid = false; }
    if (!valid) return;

    // Auto-generate name if blank
    if (!name) name = generateAutoName(category);

    const seasons     = Array.from(form.querySelectorAll('input[name="seasons"]:checked')).map(cb => cb.value);
    const occasions   = Array.from(form.querySelectorAll('input[name="occasions"]:checked')).map(cb => cb.value);
    const weatherTags = Array.from(form.querySelectorAll('input[name="weatherTags"]:checked')).map(cb => cb.value);

    const imageUri = rawImage && isTauri() ? await saveImageFile(rawImage) : rawImage;
    const itemData = { name, category, color, warmth, seasons, occasions, weatherTags, notes, imageUri };

    try {
      store.addItem(itemData);
      window.location.hash = '#/wardrobe';
    } catch (err) {
      if (err.code === 'QUOTA_EXCEEDED') {
        showError('name-error', err.message);
      } else {
        console.error('Failed to save item:', err);
      }
    }
  });
}

// ── Image preview & crop ──────────────────────────────────────────────────────

function showPreview(dataUrl, imageInput, previewContainer) {
  previewContainer.innerHTML = `
    <div class="image-preview-wrap" style="margin-top:10px">
      <img src="${dataUrl}" alt="Preview" class="image-preview">
      <button id="crop-btn" type="button" class="btn btn-secondary btn-sm" style="margin-top:8px">Crop Image</button>
    </div>
  `;
  imageInput.dataset.base64 = dataUrl;
  attachCropHandler(previewContainer.querySelector('#crop-btn'), dataUrl, imageInput, previewContainer);
}

function attachCropHandler(btn, srcUrl, imageInput, previewContainer) {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openCropModal(srcUrl, async (croppedDataUrl) => {
      showPreview(croppedDataUrl, imageInput, previewContainer);
      // Re-detect color after crop
      const colorInput = document.querySelector('#color');
      if (colorInput) {
        const color = await detectDominantColor(croppedDataUrl);
        if (color) colorInput.value = color;
      }
    });
  });
}

function openCropModal(imageSrc, onCrop) {
  if (typeof Cropper === 'undefined') {
    alert('Image cropper is not available. The image will be used as-is.');
    onCrop(imageSrc);
    return;
  }
  const modal = document.createElement('div');
  modal.className = 'crop-modal';
  modal.innerHTML = `
    <div class="crop-modal-inner">
      <h3>Crop Image</h3>
      <img id="crop-image" src="${imageSrc}" style="max-width:100%">
      <div class="crop-modal-actions">
        <button id="crop-cancel" class="btn btn-secondary">Cancel</button>
        <button id="crop-apply" class="btn btn-primary">Apply Crop</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const img = modal.querySelector('#crop-image');
  try {
    const cropper = new Cropper(img, { aspectRatio: NaN, viewMode: 1 });
    modal.querySelector('#crop-cancel').addEventListener('click', () => {
      cropper.destroy();
      document.body.removeChild(modal);
    });
    modal.querySelector('#crop-apply').addEventListener('click', () => {
      onCrop(cropper.getCroppedCanvas().toDataURL());
      cropper.destroy();
      document.body.removeChild(modal);
    });
  } catch (err) {
    console.error('Cropper initialization failed:', err);
    document.body.removeChild(modal);
    onCrop(imageSrc);
  }
}

// ── Weather tag auto-suggest ──────────────────────────────────────────────────

function applyWarmthTags(wrap, level) {
  const suggested = new Set(WARMTH_TAGS[level] || []);
  // Collect all tags that belong to any warmth level (to know which to clear)
  const allAutoTags = new Set(Object.values(WARMTH_TAGS).flat());

  wrap.querySelectorAll('input[data-weather-tag]').forEach(cb => {
    const tag = cb.dataset.weatherTag;
    if (allAutoTags.has(tag)) {
      // Only touch auto-managed tags — check the ones for this warmth, uncheck others
      cb.checked = suggested.has(tag);
    }
  });
}

// ── Error helpers ─────────────────────────────────────────────────────────────

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) { el.textContent = message; el.style.display = 'block'; }
}

function clearErrors(wrap) {
  wrap.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}
