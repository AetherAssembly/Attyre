// pages/item-detail.js - Item detail/edit page

import * as store from '../store.js';
import { isElectron, resolveImageUri, saveImageFile } from '../electron-bridge.js';

const CATEGORIES = ['top', 'bottom', 'outerwear', 'shoes', 'accessory'];
const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const OCCASIONS = ['casual', 'work', 'formal', 'party', 'outdoor', 'sport'];
const WEATHER_TAGS = ['sunny', 'cloudy', 'rain', 'light-rain', 'heavy-rain', 'snow', 'wind', 'humid', 'foggy', 'cold', 'hot'];

function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}

export async function renderItemDetail(container, itemId) {
  const item = await store.getItemById(itemId);
  if (!item) { window.location.hash = '#/wardrobe'; return; }

  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';

  wrap.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Item</h1>
      </div>
    </div>

    <div class="section-card">
      <form id="item-detail-form">
        <div class="form-group">
          <label class="form-label" for="name">Name *</label>
          <input type="text" id="name" name="name" value="${esc(item.name)}" placeholder="e.g. Blue Jeans" required>
          <p class="field-error" id="name-error" style="display:none"></p>
        </div>

        <div class="form-group">
          <label class="form-label" for="category">Category *</label>
          <select id="category" name="category" required>
            <option value="">Select a category</option>
            ${CATEGORIES.map(cat => `<option value="${cat}" ${item.category === cat ? 'selected' : ''}>${capitalize(cat)}</option>`).join('')}
          </select>
          <p class="field-error" id="category-error" style="display:none"></p>
        </div>

        <div class="form-group">
          <label class="form-label" for="color">Color</label>
          <input type="text" id="color" name="color" value="${esc(item.color || '')}" placeholder="e.g. navy blue">
        </div>

        <div class="form-group">
          <label class="form-label">Warmth Level *</label>
          <div class="warmth-row">
            ${[1, 2, 3, 4, 5].map(level => `
              <button type="button" class="warmth-btn ${item.warmth === level ? 'active' : ''}" data-warmth="${level}">
                ${level}
                <small>${getWarmthLabel(level)}</small>
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="warmth" name="warmth" value="${item.warmth || ''}">
          <p class="field-error" id="warmth-error" style="display:none"></p>
        </div>

        <div class="form-group">
          <label class="form-label">Seasons</label>
          <div class="checkbox-grid checkbox-grid-2">
            ${SEASONS.map(season => `
              <label class="checkbox-item">
                <input type="checkbox" name="seasons" value="${season}" ${item.seasons && item.seasons.includes(season) ? 'checked' : ''}>
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
                <input type="checkbox" name="occasions" value="${occasion}" ${item.occasions && item.occasions.includes(occasion) ? 'checked' : ''}>
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
                <input type="checkbox" name="weatherTags" value="${tag}" ${item.weatherTags && item.weatherTags.includes(tag) ? 'checked' : ''}>
                ${capitalize(tag.replace('-', ' '))}
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="image">Image</label>
          <div id="image-preview-container">
            ${item.imageUri ? `
              <div class="image-preview-wrap">
                <img src="${esc(resolveImageUri(item.imageUri))}" alt="Preview" class="image-preview">
                <button id="existing-crop-btn" type="button" class="btn btn-secondary btn-sm" style="margin-top:8px">Crop Image</button>
              </div>
            ` : ''}
          </div>
          <input type="file" id="image" name="image" accept="image/*" style="margin-top:8px">
        </div>

        <div class="form-group">
          <label class="form-label" for="notes">Notes</label>
          <textarea id="notes" name="notes" placeholder="Any additional details...">${esc(item.notes || '')}</textarea>
        </div>

        <div class="btn-stack" style="margin-top:8px">
          <button type="submit" class="btn btn-primary btn-full">Save Changes</button>
          <a href="#/wardrobe" class="btn btn-secondary btn-full">Cancel</a>
          ${item.laundryStatus === 'dirty' ? `<button type="button" id="mark-clean-btn" class="btn btn-secondary btn-full">Mark as Clean</button>` : ''}
          <button type="button" id="delete-btn" class="btn btn-danger btn-full">Delete Item</button>
        </div>

        <div id="delete-confirm" style="display:none" class="inline-confirm">
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          <div class="btn-group">
            <button type="button" id="confirm-delete" class="btn btn-danger">Confirm Delete</button>
            <button type="button" id="cancel-delete" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  `;

  container.appendChild(wrap);
  attachEventListeners(wrap, item);
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

  warmthButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      warmthButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      warmthInput.value = btn.dataset.warmth;
    });
  });

  // Wire crop button on existing image
  const existingCropBtn = container.querySelector('#existing-crop-btn');
  if (existingCropBtn && item.imageUri) {
    attachCropHandler(existingCropBtn, item.imageUri, imageInput, previewContainer);
  }

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      previewContainer.innerHTML = `
        <div class="image-preview-wrap">
          <img src="${dataUrl}" alt="Preview" class="image-preview">
          <button id="new-crop-btn" type="button" class="btn btn-secondary btn-sm" style="margin-top:8px">Crop Image</button>
        </div>
      `;
      imageInput.dataset.base64 = dataUrl;
      attachCropHandler(previewContainer.querySelector('#new-crop-btn'), dataUrl, imageInput, previewContainer);
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', async (e) => {
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

    const changes = { name, category, color, warmth, seasons, occasions, weatherTags, notes };
    if (imageInput.dataset.base64) {
      changes.imageUri = isElectron()
        ? await saveImageFile(imageInput.dataset.base64)
        : imageInput.dataset.base64;
    }

    try {
      await store.updateItem(item.id, changes);
      window.location.hash = '#/wardrobe';
    } catch (err) {
      if (err.code === 'QUOTA_EXCEEDED') {
        showError('name-error', err.message);
      } else {
        console.error('Failed to update item:', err);
      }
    }
  });

  const markCleanBtn = container.querySelector('#mark-clean-btn');
  if (markCleanBtn) {
    markCleanBtn.addEventListener('click', async () => {
      await store.markItemClean(item.id);
      markCleanBtn.textContent = 'Marked clean';
      markCleanBtn.disabled = true;
    });
  }

  deleteBtn.addEventListener('click', () => { deleteBtn.style.display = 'none'; deleteConfirm.style.display = 'block'; });
  cancelDeleteBtn.addEventListener('click', () => { deleteConfirm.style.display = 'none'; deleteBtn.style.display = ''; });
  confirmDeleteBtn.addEventListener('click', async () => { await store.deleteItem(item.id); window.location.hash = '#/wardrobe'; });
}

function attachCropHandler(btn, srcUrl, imageInput, previewContainer) {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openCropModal(srcUrl, (croppedDataUrl) => {
      previewContainer.innerHTML = `
        <div class="image-preview-wrap">
          <img src="${croppedDataUrl}" alt="Preview" class="image-preview">
          <button id="new-crop-btn" type="button" class="btn btn-secondary btn-sm" style="margin-top:8px">Crop Image</button>
        </div>
      `;
      imageInput.dataset.base64 = croppedDataUrl;
      attachCropHandler(previewContainer.querySelector('#new-crop-btn'), croppedDataUrl, imageInput, previewContainer);
    });
  });
}

function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) { errorEl.textContent = message; errorEl.style.display = 'block'; }
}

function clearErrors(container) {
  (container || document).querySelectorAll('.field-error').forEach(el => { el.textContent = ''; el.style.display = 'none'; });
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function getWarmthLabel(level) {
  return { 1: 'Freezing', 2: 'Cold', 3: 'Mild', 4: 'Warm', 5: 'Hot' }[level] || '';
}

function openCropModal(imageSrc, onCrop) {
  if (typeof Cropper === 'undefined') { alert('Image cropper is not available. The image will be used as-is.'); onCrop(imageSrc); return; }
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
    modal.querySelector('#crop-apply').addEventListener('click', () => { onCrop(cropper.getCroppedCanvas().toDataURL()); cropper.destroy(); document.body.removeChild(modal); });
  } catch (err) {
    console.error('Cropper initialization failed:', err);
    document.body.removeChild(modal);
    onCrop(imageSrc);
  }
}
