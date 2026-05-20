// pages/settings.js

import * as store from '../store.js';
import { updateAccessibilityMode, updateDarkMode, APP_VERSION } from '../app.js';


export function renderSettings(container) {
  try {
    _renderSettings(container);
  } catch (err) {
    console.error('renderSettings failed:', err);
    container.innerHTML = `<div class="page-wrap"><div class="alert alert-warning" style="margin-top:2rem"><span class="alert-icon">⚠</span><span>Settings failed to load. <a href="#/">Go home</a></span></div></div>`;
  }
}

function _renderSettings(container) {
  const isAccessibility = store.isAccessibilityMode();
  const isDarkMode = store.isDarkMode();
  const itemCount = store.getItems().length;

  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';

  wrap.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Preferences, backup, and app info</p>
      </div>
    </div>

    <!-- Appearance -->
    <div class="section-card">
      <div class="section-card-title">Appearance</div>

      <div class="settings-row">
        <div>
          <div class="settings-row-label">Dark Mode</div>
          <div class="settings-row-hint">Switch to a dark colour scheme</div>
        </div>
        <label class="toggle" aria-label="Toggle dark mode">
          <input type="checkbox" id="dark-mode-toggle" ${isDarkMode ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>

      <div class="settings-row">
        <div>
          <div class="settings-row-label">Accessibility Mode</div>
          <div class="settings-row-hint">Colorblind-friendly palette, larger text, stronger borders</div>
        </div>
        <label class="toggle" aria-label="Toggle accessibility mode">
          <input type="checkbox" id="accessibility-toggle" ${isAccessibility ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>
    </div>

    <!-- Wardrobe -->
    <div class="section-card">
      <div class="section-card-title">Wardrobe</div>
      <div class="settings-row">
        <div>
          <div class="settings-row-label">Items in wardrobe</div>
          <div class="settings-row-hint">Manage items from the Wardrobe page</div>
        </div>
        <span style="font-size:20px;font-weight:700;color:var(--text-primary)">${itemCount}</span>
      </div>
    </div>

    <!-- Backup & Restore -->
    <div class="section-card">
      <div class="section-card-title">Backup &amp; Restore</div>

      <div class="settings-row" style="flex-wrap:wrap;gap:10px">
        <div>
          <div class="settings-row-label">Export backup</div>
          <div class="settings-row-hint">Download your wardrobe as a JSON file</div>
        </div>
        <button id="export-btn" class="btn btn-secondary btn-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export JSON
        </button>
        <a id="download-link" style="display:none"></a>
      </div>

      <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:8px">
        <div class="settings-row-label">Import backup</div>
        <div class="settings-row-hint">Restore from a previously exported JSON file. This will merge with your existing items.</div>
        <label class="btn btn-secondary btn-sm" style="margin-top:4px;cursor:pointer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 5 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span id="import-label">Choose file…</span>
          <input type="file" id="import-file" accept=".json" aria-describedby="import-error import-success" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none">
        </label>
        <p class="error" id="import-error" style="margin:0"></p>
        <p class="success" id="import-success" style="margin:0"></p>
      </div>
    </div>

    <!-- Links -->
    <div class="section-card">
      <div class="section-card-title">Info &amp; Links</div>

      <a href="Privacy-Policy.html" target="_blank" class="settings-row settings-link-row">
        <div class="settings-link-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div style="flex:1">
          <div class="settings-row-label">Privacy Policy</div>
          <div class="settings-row-hint">How Attyre handles (or rather, doesn't handle) your data</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;opacity:0.35"><polyline points="9 18 15 12 9 6"/></svg>
      </a>

      <a href="https://github.com/AetherAssembly/Attyre" target="_blank" rel="noopener" class="settings-row settings-link-row">
        <div class="settings-link-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
        </div>
        <div style="flex:1">
          <div class="settings-row-label">Attyre on GitHub</div>
          <div class="settings-row-hint">Source code, issues, and releases</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;opacity:0.35"><polyline points="9 18 15 12 9 6"/></svg>
      </a>

      <a href="https://aetherassembly.org/about" target="_blank" rel="noopener" class="settings-row settings-link-row">
        <div class="settings-link-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div style="flex:1">
          <div class="settings-row-label">AetherAssembly</div>
          <div class="settings-row-hint">The team behind Attyre</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;opacity:0.35"><polyline points="9 18 15 12 9 6"/></svg>
      </a>

      <a href="mailto:support@aetherassembly.org" class="settings-row settings-link-row">
        <div class="settings-link-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <div style="flex:1">
          <div class="settings-row-label">Get help</div>
          <div class="settings-row-hint">support@aetherassembly.org</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;opacity:0.35"><polyline points="9 18 15 12 9 6"/></svg>
      </a>

      <a href="mailto:contact@aetherassembly.org" class="settings-row settings-link-row">
        <div class="settings-link-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <div style="flex:1">
          <div class="settings-row-label">Contact us</div>
          <div class="settings-row-hint">contact@aetherassembly.org</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;opacity:0.35"><polyline points="9 18 15 12 9 6"/></svg>
      </a>
    </div>

    <!-- Version -->
    <div class="section-card">
      <div class="section-card-title">About</div>
      <div class="settings-row">
        <div class="settings-row-label">App version</div>
        <span style="font-size:13px;color:var(--text-muted);font-family:monospace" id="version-display"></span>
      </div>
      <div class="settings-row">
        <div class="settings-row-label">Built by</div>
        <span style="font-size:13px;color:var(--text-muted)">AetherAssembly</span>
      </div>
    </div>
  `;

  container.appendChild(wrap);

  // Toggles
  wrap.querySelector('#accessibility-toggle').addEventListener('change', e => {
    store.setAccessibilityMode(e.target.checked);
    updateAccessibilityMode(e.target.checked);
  });

  wrap.querySelector('#dark-mode-toggle').addEventListener('change', e => {
    store.setDarkMode(e.target.checked);
    updateDarkMode(e.target.checked);
  });

  // Export
  const exportBtn = wrap.querySelector('#export-btn');
  const downloadLink = wrap.querySelector('#download-link');
  exportBtn.addEventListener('click', () => {
    const json = store.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = 'attyre-backup.json';
    downloadLink.click();
    URL.revokeObjectURL(url);
  });

  // Import
  const importFile = wrap.querySelector('#import-file');
  const importError = wrap.querySelector('#import-error');
  const importSuccess = wrap.querySelector('#import-success');

  importFile.addEventListener('change', () => {
    importError.textContent = '';
    importSuccess.textContent = '';
    const file = importFile.files[0];
    const importLabel = wrap.querySelector('#import-label');
    if (importLabel) importLabel.textContent = file ? file.name : 'Choose file…';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const count = store.importJSON(e.target.result);
        importSuccess.textContent = `Imported ${count} item${count !== 1 ? 's' : ''} successfully.`;
        setTimeout(() => { window.location.hash = '#/wardrobe'; }, 1000);
      } catch (err) {
        importError.textContent = `Error: ${err.message}`;
      }
    };
    reader.readAsText(file);
  });

  // Version
  wrap.querySelector('#version-display').textContent = APP_VERSION;
}
