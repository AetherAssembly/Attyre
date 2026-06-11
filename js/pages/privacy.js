// pages/privacy.js

import { openLink } from '../electron-bridge.js';

export function renderPrivacy(container) {
  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';

  wrap.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Privacy Policy</h1>
        <p class="page-subtitle">Last updated: May 2026 &nbsp;&middot;&nbsp; Attyre by AetherAssembly &nbsp;&middot;&nbsp; attyre.org</p>
      </div>
    </div>

    <div class="section-card" style="padding:20px 24px">
      <div style="background:var(--bg-surface-raised,var(--bg-surface));border-left:3px solid var(--color-primary,#C9A96E);border-radius:8px;padding:1rem 1.25rem;margin-bottom:1.5rem;font-size:0.95rem">
        <strong>Short version:</strong> Attyre collects nothing. Your wardrobe data never leaves your device. There are no accounts, no servers, no tracking, and no third-party data sharing of any kind.
      </div>

      <h2 style="font-size:1rem;font-weight:700;margin:1.5rem 0 0.4rem;color:var(--text-primary)">1. Who We Are</h2>
      <p style="color:var(--text-secondary);margin-bottom:0.75rem">Attyre is a free wardrobe management app developed by AetherAssembly, a small team consisting of Aster, Ollie, and Milo. You can reach us at <button class="link-btn" data-href="mailto:support@aetherassembly.org">support@aetherassembly.org</button> or via our <button class="link-btn" data-href="https://forms.gle/T4i7GGzaT3HUrffm9">contact form</button>.</p>

      <h2 style="font-size:1rem;font-weight:700;margin:1.5rem 0 0.4rem;color:var(--text-primary)">2. Data We Do Not Collect</h2>
      <p style="color:var(--text-secondary);margin-bottom:0.5rem">We do not collect, store, transmit, or process any personal data on our servers — because we don't have any servers. Specifically, we do not collect:</p>
      <ul style="color:var(--text-secondary);margin:0 0 0.75rem 1.25rem;line-height:1.8">
        <li>Your name, email address, or any identifying information</li>
        <li>Your location or IP address</li>
        <li>Your wardrobe items, photos, or notes</li>
        <li>Usage data, analytics, or behavioural telemetry</li>
        <li>Cookies of any kind</li>
      </ul>

      <h2 style="font-size:1rem;font-weight:700;margin:1.5rem 0 0.4rem;color:var(--text-primary)">3. Data Stored on Your Device</h2>
      <p style="color:var(--text-secondary);margin-bottom:0.5rem">Attyre stores the following data locally, on your device only:</p>
      <ul style="color:var(--text-secondary);margin:0 0 0.75rem 1.25rem;line-height:1.8">
        <li>Your clothing items (names, categories, tags, warmth levels, notes)</li>
        <li>Any photos you attach to items</li>
        <li>Saved outfit combinations and calendar plans</li>
        <li>App preferences (dark mode, accessibility mode)</li>
      </ul>
      <p style="color:var(--text-secondary);margin-bottom:0.5rem"><strong>Web app:</strong> data is stored in your browser's <code>localStorage</code>. Clearing your browser cache or localStorage will permanently delete all Attyre data.</p>
      <p style="color:var(--text-secondary);margin-bottom:0.75rem"><strong>Desktop app:</strong> data is stored in your OS app data directory (<code>%APPDATA%\attyre</code> on Windows, <code>~/.local/share/attyre</code> on Linux). Photos are saved as image files in an <code>images/</code> subfolder. Uninstalling the app does not automatically delete this folder.</p>
      <p style="color:var(--text-secondary);margin-bottom:0.75rem">This data is entirely under your control. You can export it, delete it, or wipe it at any time from the Settings page. There is no cloud backup.</p>

      <h2 style="font-size:1rem;font-weight:700;margin:1.5rem 0 0.4rem;color:var(--text-primary)">4. Third-Party APIs</h2>
      <p style="color:var(--text-secondary);margin-bottom:0.5rem">When you use the Suggest Outfit feature, Attyre makes two outbound requests to fetch weather data. No personal data is sent, only the city name you type:</p>
      <ul style="color:var(--text-secondary);margin:0 0 0.75rem 1.25rem;line-height:1.8">
        <li><strong>OpenStreetMap Nominatim</strong> (<button class="link-btn" data-href="https://nominatim.openstreetmap.org">nominatim.openstreetmap.org</button>) — converts a city name to coordinates. Subject to the <button class="link-btn" data-href="https://operations.osmfoundation.org/policies/nominatim/">Nominatim Usage Policy</button>.</li>
        <li><strong>Open-Meteo</strong> (<button class="link-btn" data-href="https://open-meteo.com">open-meteo.com</button>) — fetches current temperature. Subject to the <button class="link-btn" data-href="https://open-meteo.com/en/terms">Open-Meteo Terms</button>.</li>
      </ul>
      <p style="color:var(--text-secondary);margin-bottom:0.75rem">Both are free, open services with no affiliation to AetherAssembly. Their own privacy policies apply to any data they may collect from API requests.</p>
      <p style="color:var(--text-secondary);margin-bottom:0.75rem">If you do not use the Suggest Outfit feature, no outbound requests are made at all.</p>

      <h2 style="font-size:1rem;font-weight:700;margin:1.5rem 0 0.4rem;color:var(--text-primary)">5. Children's Privacy</h2>
      <p style="color:var(--text-secondary);margin-bottom:0.75rem">Attyre is a general-purpose tool with no age restrictions. Because we collect no personal data from anyone, there is nothing specific to disclose regarding children's privacy.</p>

      <h2 style="font-size:1rem;font-weight:700;margin:1.5rem 0 0.4rem;color:var(--text-primary)">6. Your Rights</h2>
      <p style="color:var(--text-secondary);margin-bottom:0.75rem">Since we hold no data about you, there is nothing to request, correct, or delete on our end. To manage or delete your own data, use the Export and Import tools in the Settings page, or clear your browser's localStorage directly.</p>

      <h2 style="font-size:1rem;font-weight:700;margin:1.5rem 0 0.4rem;color:var(--text-primary)">7. Support</h2>
      <p style="color:var(--text-secondary);margin-bottom:0.5rem">Attyre is actively maintained by AetherAssembly. Support is provided for the current release and the two most recent major versions. For help, questions, or to report an issue:</p>
      <ul style="color:var(--text-secondary);margin:0 0 0.75rem 1.25rem;line-height:1.8">
        <li>Email: <button class="link-btn" data-href="mailto:support@aetherassembly.org">support@aetherassembly.org</button></li>
        <li>Contact form: <button class="link-btn" data-href="https://forms.gle/T4i7GGzaT3HUrffm9">forms.gle/T4i7GGzaT3HUrffm9</button></li>
      </ul>

      <h2 style="font-size:1rem;font-weight:700;margin:1.5rem 0 0.4rem;color:var(--text-primary)">8. Changes to This Policy</h2>
      <p style="color:var(--text-secondary);margin-bottom:0.75rem">If this policy changes in a meaningful way, we will update the date at the top of this page and note what changed. We will never introduce data collection silently.</p>

      <h2 style="font-size:1rem;font-weight:700;margin:1.5rem 0 0.4rem;color:var(--text-primary)">9. Contact</h2>
      <p style="color:var(--text-secondary);margin-bottom:0.75rem">Questions or concerns? Reach us at <button class="link-btn" data-href="mailto:support@aetherassembly.org">support@aetherassembly.org</button> or via our <button class="link-btn" data-href="https://forms.gle/T4i7GGzaT3HUrffm9">contact form</button>.</p>

      <div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border-subtle,var(--border));font-size:0.85rem;color:var(--text-muted);text-align:center">
        &copy; 2026 AetherAssembly &nbsp;&middot;&nbsp; Attyre &nbsp;&middot;&nbsp; <a href="#/settings" style="color:var(--color-primary,#C9A96E)">Back to Settings</a>
      </div>
    </div>
  `;

  container.appendChild(wrap);

  wrap.querySelectorAll('.link-btn').forEach(btn => {
    btn.addEventListener('click', () => openLink(btn.dataset.href));
  });
}
