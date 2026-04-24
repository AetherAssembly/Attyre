// pages/settings.js - Settings page

import * as store from '../store.js';
import { updateAccessibilityMode, updateDarkMode, APP_VERSION } from '../app.js';

export function renderSettings(container) {
  const isAccessibility = store.isAccessibilityMode();
  const isDarkMode = store.isDarkMode();
  const itemCount = store.getItems().length;

  const html = `
    <div class="page-container">
      <div class="container">
        <h1>Settings</h1>

        <!-- Accessibility -->
        <div class="settings-section">
          <h3>Accessibility</h3>
          <div class="settings-item">
            <label class="toggle-label">
              <input type="checkbox" id="accessibility-toggle" ${isAccessibility ? 'checked' : ''}>
              <span>Accessibility Mode (Colorblind-Friendly)</span>
            </label>
            <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">Uses safe colors and icons for all types of colorblindness (protanopia, deuteranopia, tritanopia, achromatopsia).</p>
          </div>
          <div class="settings-item">
            <label class="toggle-label">
              <input type="checkbox" id="dark-mode-toggle" ${isDarkMode ? 'checked' : ''}>
              <span>Dark Mode</span>
            </label>
          </div>
        </div>

        <!-- Wardrobe Info -->
        <div class="settings-section">
          <h3>Wardrobe</h3>
          <div class="settings-item">
            <p>You have <strong>${itemCount}</strong> item${itemCount !== 1 ? 's' : ''} in your wardrobe.</p>
          </div>
        </div>

        <!-- Export / Import -->
        <div class="settings-section">
          <h3>Backup & Restore</h3>
          <div class="settings-item">
            <button id="export-btn" class="btn secondary">Export Backup (JSON)</button>
            <a id="download-link" style="display: none;"></a>
          </div>
          <div class="settings-item">
            <label for="import-file">Import Backup (JSON)</label>
            <input type="file" id="import-file" accept=".json">
            <p class="error" id="import-error"></p>
            <p class="success" id="import-success"></p>
          </div>
        </div>

        <!-- The Part Nobody Reads -->
        <div class="settings-section">
          <h3>The Part Nobody Reads</h3>
          <div class="settings-item">
            <a href="Privacy-Policy.html" target="_blank" class="btn secondary" style="display: inline-block; margin: 0.5rem 0;">View Privacy Policy</a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="settings-section">
          <h3>Quick Links</h3>
          <div class="settings-item">
            <a href="https://github.com/aetherassembly" target="_blank" class="btn secondary" style="display: inline-block; margin: 0.5rem 0;">AetherAssembly GitHub</a>
          </div>
          <div class="settings-item">
            <a href="mailto:support@aetherassembly.org" target="_blank" class="btn secondary" style="display: inline-block; margin: 0.5rem 0;">Helpdesk Email</a>
          </div>
          <div class="settings-item">
            <a href="https://github.com/aetherassembly/attyre" target="_blank" class="btn secondary" style="display: inline-block; margin: 0.5rem 0;">Attyre GitHub</a>
          </div>
        </div>

        <!-- Version info -->
        <div class="settings-section">
          <h3>App Version</h3>
          <div class="settings-item" id="version-display"></div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Accessibility toggle
  const accessibilityToggle = container.querySelector('#accessibility-toggle');
  accessibilityToggle.addEventListener('change', () => {
    const isChecked = accessibilityToggle.checked;
    store.setAccessibilityMode(isChecked);
    updateAccessibilityMode(isChecked);
  });

  // Dark mode toggle
  const darkModeToggle = container.querySelector('#dark-mode-toggle');
  darkModeToggle.addEventListener('change', () => {
    const isChecked = darkModeToggle.checked;
    store.setDarkMode(isChecked);
    updateDarkMode(isChecked);
  });

  // Export button
  const exportBtn = container.querySelector('#export-btn');
  const downloadLink = container.querySelector('#download-link');
  
  exportBtn.addEventListener('click', () => {
    const json = store.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    downloadLink.href = url;
    downloadLink.download = 'attyre-backup.json';
    downloadLink.click();
    
    URL.revokeObjectURL(url);
  });

  // Import file
  const importFile = container.querySelector('#import-file');
  const importError = container.querySelector('#import-error');
  const importSuccess = container.querySelector('#import-success');

  // Display version
  const versionEl = container.querySelector('#version-display');
  if (versionEl) {
    versionEl.textContent = APP_VERSION;
  }

  importFile.addEventListener('change', () => {
    importError.textContent = '';
    importSuccess.textContent = '';

    const file = importFile.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target.result;
        const count = store.importJSON(jsonString);
        importSuccess.textContent = `Successfully imported ${count} item${count !== 1 ? 's' : ''}.`;
        
        // Reload page to show new items
        setTimeout(() => {
          window.location.hash = '#/wardrobe';
        }, 1000);
      } catch (err) {
        importError.textContent = `Error: ${err.message}`;
      }
    };
    reader.readAsText(file);
  });
}
