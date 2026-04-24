// pages/add-item.js - Add item form page

import * as store from '../store.js';

const CATEGORIES = ['top', 'bottom', 'outerwear', 'shoes', 'accessory'];
const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const OCCASIONS = ['casual', 'work', 'formal', 'party', 'outdoor', 'sport'];
const WEATHER_TAGS = ['sunny', 'cloudy', 'rain', 'light-rain', 'heavy-rain', 'snow', 'wind', 'humid', 'foggy', 'cold', 'hot'];

export function renderAddItem(container) {
  const html = `
    <div class="page-container">
      <div class="container">
        <h1>Add Item</h1>
        <form id="add-item-form">
          <!-- Name -->
          <label for="name">Name *</label>
          <input type="text" id="name" name="name" placeholder="e.g. Blue Jeans" required>
          <p class="error" id="name-error"></p>

          <!-- Category -->
          <label for="category">Category *</label>
          <select id="category" name="category" required>
            <option value="">Select a category</option>
            ${CATEGORIES.map(cat => `<option value="${cat}">${capitalize(cat)}</option>`).join('')}
          </select>

          <!-- Color -->
          <label for="color">Color</label>
          <input type="text" id="color" name="color" placeholder="e.g. navy blue">

          <!-- Warmth -->
          <label>Warmth Level *</label>
          <div class="warmth-buttons">
            ${[1, 2, 3, 4, 5].map(level => `
              <button type="button" class="warmth-btn" data-warmth="${level}">
                ${level}
                <small>${getWarmthLabel(level)}</small>
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="warmth" name="warmth" value="">
          <p class="error" id="warmth-error"></p>

          <!-- Seasons -->
          <label>Seasons</label>
          <div class="checkbox-grid checkbox-grid-2" id="seasons-grid">
            ${SEASONS.map(season => `
              <label class="checkbox-group">
                <input type="checkbox" name="seasons" value="${season}">
                ${capitalize(season)}
              </label>
            `).join('')}
          </div>

          <!-- Occasions -->
          <label>Occasions</label>
          <div class="checkbox-grid checkbox-grid-2" id="occasions-grid">
            ${OCCASIONS.map(occasion => `
              <label class="checkbox-group">
                <input type="checkbox" name="occasions" value="${occasion}">
                ${capitalize(occasion)}
              </label>
            `).join('')}
          </div>

          <!-- Weather Tags -->
          <label>Weather Tags</label>
          <div class="checkbox-grid checkbox-grid-3" id="weather-grid">
            ${WEATHER_TAGS.map(tag => `
              <label class="checkbox-group">
                <input type="checkbox" name="weatherTags" value="${tag}">
                ${capitalize(tag.replace('-', ' '))}
              </label>
            `).join('')}
          </div>

          <!-- Image -->
          <label for="image">Image</label>
          <input type="file" id="image" name="image" accept="image/*">
          <div id="image-preview-container"></div>

          <!-- Notes -->
          <label for="notes">Notes</label>
          <textarea id="notes" name="notes" placeholder="Any additional details..."></textarea>

          <!-- Buttons -->
          <div class="button-group-vertical">
            <button type="submit" class="btn primary">Save Item</button>
            <a href="#/wardrobe" class="btn secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `;

  container.innerHTML = html;
  attachEventListeners(container);
}

function attachEventListeners(container) {
  const form = container.querySelector('#add-item-form');
  const warmthButtons = container.querySelectorAll('.warmth-btn');
  const warmthInput = container.querySelector('#warmth');
  const imageInput = container.querySelector('#image');
  const previewContainer = container.querySelector('#image-preview-container');

  // Warmth button selection
  warmthButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      warmthButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      warmthInput.value = btn.dataset.warmth;
    });
  });

  // Image preview
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      previewContainer.innerHTML = `
        <img src="${dataUrl}" alt="Preview" class="image-preview">
        <button id="crop-btn" class="btn secondary">Crop Image</button>
      `;
      
      // Store in input as data attribute for later retrieval
      imageInput.dataset.base64 = dataUrl;

      // Attach crop event
      const cropBtn = previewContainer.querySelector('#crop-btn');
      cropBtn.addEventListener('click', () => {
        openCropModal(dataUrl, (croppedDataUrl) => {
          previewContainer.innerHTML = `
            <img src="${croppedDataUrl}" alt="Preview" class="image-preview">
            <button id="crop-btn" class="btn secondary">Crop Image</button>
          `;
          imageInput.dataset.base64 = croppedDataUrl;
        });
      });
    };
    reader.readAsDataURL(file);
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const name = form.querySelector('#name').value.trim();
    const category = form.querySelector('#category').value;
    const color = form.querySelector('#color').value.trim();
    const warmth = parseInt(warmthInput.value);
    const notes = form.querySelector('#notes').value.trim();

    // Validation
    if (!name) {
      showError('name-error', 'Name is required');
      return;
    }

    if (!category) {
      showError('category-error', 'Category is required');
      return;
    }

    if (!warmth) {
      showError('warmth-error', 'Please select a warmth level');
      return;
    }

    // Collect checked values
    const seasons = Array.from(form.querySelectorAll('input[name="seasons"]:checked')).map(cb => cb.value);
    const occasions = Array.from(form.querySelectorAll('input[name="occasions"]:checked')).map(cb => cb.value);
    const weatherTags = Array.from(form.querySelectorAll('input[name="weatherTags"]:checked')).map(cb => cb.value);

    const itemData = {
      name,
      category,
      color,
      warmth,
      seasons,
      occasions,
      weatherTags,
      notes,
      imageUri: imageInput.dataset.base64 || '',
    };

    store.addItem(itemData);
    window.location.hash = '#/wardrobe';
  });
}

function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getWarmthLabel(level) {
  const labels = {
    1: 'Very Light',
    2: 'Light',
    3: 'Medium',
    4: 'Warm',
    5: 'Very Warm'
  };
  return labels[level] || '';
}

function openCropModal(imageSrc, onCrop) {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'crop-modal';
  modal.innerHTML = `
    <div class="crop-modal-content">
      <h3>Crop Image</h3>
      <img id="crop-image" src="${imageSrc}" style="max-width: 100%;">
      <div class="crop-buttons">
        <button id="crop-cancel" class="btn secondary">Cancel</button>
        <button id="crop-apply" class="btn primary">Apply Crop</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const img = modal.querySelector('#crop-image');
  const cropper = new Cropper(img, {
    aspectRatio: NaN, // Free crop
    viewMode: 1,
  });

  modal.querySelector('#crop-cancel').addEventListener('click', () => {
    cropper.destroy();
    document.body.removeChild(modal);
  });

  modal.querySelector('#crop-apply').addEventListener('click', () => {
    const canvas = cropper.getCroppedCanvas();
    const croppedDataUrl = canvas.toDataURL();
    onCrop(croppedDataUrl);
    cropper.destroy();
    document.body.removeChild(modal);
  });
}
