// pages/add-item.js - Add item form page

import * as store from '../store.js';

const CATEGORIES = ['top', 'bottom', 'outerwear', 'shoes', 'accessory'];
const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const OCCASIONS = ['casual', 'work', 'formal', 'party', 'outdoor', 'sport'];
const WEATHER_TAGS = ['sunny', 'cloudy', 'rain', 'light-rain', 'heavy-rain', 'snow', 'wind', 'humid', 'foggy', 'cold', 'hot'];

export function renderAddItem(container) {
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
        <div class="form-group">
          <label class="form-label" for="name">Name *</label>
          <input type="text" id="name" name="name" placeholder="e.g. Blue Jeans" required aria-describedby="name-error">
          <p class="field-error" id="name-error" style="display:none"></p>
        </div>

        <div class="form-group">
          <label class="form-label" for="category">Category *</label>
          <select id="category" name="category" required aria-describedby="category-error">
            <option value="">Select a category</option>
            ${CATEGORIES.map(cat => `<option value="${cat}">${capitalize(cat)}</option>`).join('')}
          </select>
          <p class="field-error" id="category-error" style="display:none"></p>
        </div>

        <div class="form-group">
          <label class="form-label" for="color">Color</label>
          <input type="text" id="color" name="color" placeholder="e.g. navy blue">
        </div>

        <div class="form-group">
          <label class="form-label">Warmth Level *</label>
          <div class="warmth-row">
            ${[1, 2, 3, 4, 5].map(level => `
              <button type="button" class="warmth-btn" data-warmth="${level}">
                ${level}
                <small>${getWarmthLabel(level)}</small>
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="warmth" name="warmth" value="">
          <p class="field-error" id="warmth-error" style="display:none"></p>
        </div>

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

        <div class="form-group">
          <label class="form-label">Weather Tags</label>
          <div class="checkbox-grid checkbox-grid-3">
            ${WEATHER_TAGS.map(tag => `
              <label class="checkbox-item">
                <input type="checkbox" name="weatherTags" value="${tag}">
                ${capitalize(tag.replace('-', ' '))}
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="image">Image</label>
          <input type="file" id="image" name="image" accept="image/*">
          <div id="image-preview-container"></div>
        </div>

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

function attachEventListeners(container) {
  const form = container.querySelector('#add-item-form');
  const warmthButtons = container.querySelectorAll('.warmth-btn');
  const warmthInput = container.querySelector('#warmth');
  const imageInput = container.querySelector('#image');
  const previewContainer = container.querySelector('#image-preview-container');

  warmthButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      warmthButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      warmthInput.value = btn.dataset.warmth;
    });
  });

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      previewContainer.innerHTML = `
        <div class="image-preview-wrap" style="margin-top:10px">
          <img src="${dataUrl}" alt="Preview" class="image-preview">
          <button id="crop-btn" type="button" class="btn btn-secondary btn-sm" style="margin-top:8px">Crop Image</button>
        </div>
      `;
      imageInput.dataset.base64 = dataUrl;
      attachCropHandler(previewContainer.querySelector('#crop-btn'), dataUrl, imageInput, previewContainer);
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(container);

    const name = form.querySelector('#name').value.trim();
    const category = form.querySelector('#category').value;
    const color = form.querySelector('#color').value.trim();
    const warmth = parseInt(warmthInput.value);
    const notes = form.querySelector('#notes').value.trim();

    if (!name) { showError('name-error', 'Name is required'); return; }
    if (!category) { showError('category-error', 'Category is required'); return; }
    if (!warmth) { showError('warmth-error', 'Please select a warmth level'); return; }

    const seasons = Array.from(form.querySelectorAll('input[name="seasons"]:checked')).map(cb => cb.value);
    const occasions = Array.from(form.querySelectorAll('input[name="occasions"]:checked')).map(cb => cb.value);
    const weatherTags = Array.from(form.querySelectorAll('input[name="weatherTags"]:checked')).map(cb => cb.value);

    const itemData = { name, category, color, warmth, seasons, occasions, weatherTags, notes, imageUri: imageInput.dataset.base64 || '' };

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

function attachCropHandler(btn, srcUrl, imageInput, previewContainer) {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openCropModal(srcUrl, (croppedDataUrl) => {
      previewContainer.innerHTML = `
        <div class="image-preview-wrap" style="margin-top:10px">
          <img src="${croppedDataUrl}" alt="Preview" class="image-preview">
          <button id="crop-btn" type="button" class="btn btn-secondary btn-sm" style="margin-top:8px">Crop Image</button>
        </div>
      `;
      imageInput.dataset.base64 = croppedDataUrl;
      attachCropHandler(previewContainer.querySelector('#crop-btn'), croppedDataUrl, imageInput, previewContainer);
    });
  });
}

function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) { errorEl.textContent = message; errorEl.style.display = 'block'; }
}

function clearErrors(container) {
  (container || document).querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getWarmthLabel(level) {
  return { 1: 'Very Light', 2: 'Light', 3: 'Medium', 4: 'Warm', 5: 'Very Warm' }[level] || '';
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
    modal.querySelector('#crop-cancel').addEventListener('click', () => { cropper.destroy(); document.body.removeChild(modal); });
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
