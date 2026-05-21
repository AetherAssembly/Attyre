import { defineConfig } from 'vite';

// Copies files that aren't bundled by Vite (SW registered via JS string, not HTML attribute)
function copyPwaStatics() {
  return {
    name: 'copy-pwa-statics',
    async closeBundle() {
      const { copyFile, cp, mkdir } = await import('node:fs/promises');
      await mkdir('dist/assets', { recursive: true });
      await Promise.all([
        copyFile('service-worker.js', 'dist/service-worker.js'),
        copyFile('Privacy-Policy.html', 'dist/Privacy-Policy.html'),
        cp('assets', 'dist/assets', { recursive: true }),
      ]);
    },
  };
}

export default defineConfig({
  // Keep the same port so tauri.conf.json devUrl doesn't need to change
  server: {
    port: 1420,
    strictPort: true,
  },
  // Don't clear the terminal — lets Tauri/Rust output stay visible
  clearScreen: false,
  plugins: [copyPwaStatics()],
});
