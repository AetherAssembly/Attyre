// pages/item-detail.js - Item detail/edit page

import * as store from '../store.js';

const CATEGORIES = ['top', 'bottom', 'outerwear', 'shoes', 'accessory'];
const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const OCCASIONS = ['casual', 'work', 'formal', 'party', 'outdoor', 'sport'];
const WEATHER_TAGS = ['sunny', 'cloudy', 'rain', 'light-rain', 'heavy-rain', 'snow', 'wind', 'humid', 'foggy', 'cold', 'hot'];

export function renderItemDetail(container, itemId) {
  const item = store.getItemById(itemId);

  if (!item) {
    window.location.hash = '#/wardrobe';
    return;
  }

  const html = `
    <div class="page-container">
      <div class="container">
        <h1>Edit Item</h1>
        <form id="item-detail-form">
          <!-- Name -->
          <label for="name">Name *</label>
          <input type="text" id="name" name="name" value="${escapeHtml(item.name)}" placeholder="e.g. Blue Jeans" required>
          <p class="error" id="name-error"></p>

          <!-- Category -->
          <label for="category">Category *</label>
          <select id="category" name="category" required>
            <option value="">Select a category</option>
            ${CATEGORIES.map(cat => `<option value="${cat}" ${item.category === cat ? 'selected' : ''}>${capitalize(cat)}</option>`).join('')}
          </select>
          <p class="error" id="category-error"></p>

          <!-- Color -->
          <label for="color">Color</label>
          <input type="text" id="color" name="color" value="${escapeHtml(item.color || '')}" placeholder="e.g. navy blue">

          <!-- Warmth -->
          <label>Warmth Level *</label>
          <div class="warmth-buttons">
            ${[1, 2, 3, 4, 5].map(level => `
              <button type="button" class="warmth-btn ${item.warmth === level ? 'active' : ''}" data-warmth="${level}">
                ${level}
                <small>${getWarmthLabel(level)}</small>
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="warmth" name="warmth" value="${item.warmth}">

          <!-- Seasons -->
          <label>Seasons</label>
          <div class="checkbox-grid checkbox-grid-2" id="seasons-grid">
            ${SEASONS.map(season => `
              <label class="checkbox-group">
                <input type="checkbox" name="seasons" value="${season}" ${item.seasons && item.seasons.includes(season) ? 'checked' : ''}>
                ${capitalize(season)}
              </label>
            `).join('')}
          </div>

          <!-- Occasions -->
          <label>Occasions</label>
          <div class="checkbox-grid checkbox-grid-2" id="occasions-grid">
            ${OCCASIONS.map(occasion => `
              <label class="checkbox-group">
                <input type="checkbox" name="occasions" value="${occasion}" ${item.occasions && item.occasions.includes(occasion) ? 'checked' : ''}>
                ${capitalize(occasion)}
              </label>
            `).join('')}
          </div>

          <!-- Weather Tags -->
          <label>Weather Tags</label>
          <div class="checkbox-grid checkbox-grid-3" id="weather-grid">
            ${WEATHER_TAGS.map(tag => `
              <label class="checkbox-group">
                <input type="checkbox" name="weatherTags" value="${tag}" ${item.weatherTags && item.weatherTags.includes(tag) ? 'checked' : ''}>
                ${capitalize(tag.replace('-', ' '))}
              </label>
            `).join('')}
          </div>

          <!-- Image -->
          <label for="image">Image</label>
          ${item.imageUri ? `<div id="image-preview-container"><img src="${item.imageUri}" alt="Preview" class="image-preview"></div>` : `<div id="image-preview-container"></div>`}
          <input type="file" id="image" name="image" accept="image/*">

          <!-- Notes -->
          <label for="notes">Notes</label>
          <textarea id="notes" name="notes" placeholder="Any additional details...">${escapeHtml(item.notes || '')}</textarea>

          <!-- Buttons -->
          <div class="button-group-vertical">
            <button type="submit" class="btn primary">Save Changes</button>
            <a href="#/wardrobe" class="btn secondary">Cancel</a>
            <button type="button" id="delete-btn" class="btn danger">Delete Item</button>
          </div>

          <!-- Delete confirmation (hidden initially) -->
          <div id="delete-confirm" style="display: none;" class="inline-confirm">
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div class="button-group">
              <button type="button" id="confirm-delete" class="btn danger">Confirm Delete</button>
              <button type="button" id="cancel-delete" class="btn secondary">Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;

  container.innerHTML = html;
  attachEventListeners(container, item);
}

function attachEventListeners(container, item) {
  const form = container.querySelector('#item-detail-form');
  const warmthButtons = container.querySelectorAll('.warmth-btn');
  const warmthInput = container.querySelector('#warmth');
  const imageInput = container.querySelector('#image');
  const previewContainer = container.querySelector('#image-preview-container');
  const deleteBtn = container.querySelector('#delete-btn');
  const deleteConfirm = container.querySelector('#delete-confirm');
  const confirmDeleteBtn = container.querySelector('#confirm-delete');
  const cancelDeleteBtn = container.querySelector('#cancel-delete');

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
      previewContainer.innerHTML = `<img src="${dataUrl}" alt="Preview" class="image-preview">`;
      imageInput.dataset.base64 = dataUrl;
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

    const changes = {
      name,
      category,
      color,
      warmth,
      seasons,
      occasions,
      weatherTags,
      notes,
    };

    // Only update image if new one was selected
    if (imageInput.dataset.base64) {
      changes.imageUri = imageInput.dataset.base64;
    }

    store.updateItem(item.id, changes);
    window.location.hash = '#/wardrobe';
  });

  // Delete button
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    deleteBtn.style.display = 'none';
    deleteConfirm.style.display = 'block';
  });

  cancelDeleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    deleteConfirm.style.display = 'none';
    deleteBtn.style.display = 'block';
  });

  confirmDeleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    store.deleteItem(item.id);
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
