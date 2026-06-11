import { defineConfig } from 'vite';

function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    async closeBundle() {
      const { cp, mkdir } = await import('node:fs/promises');
      await mkdir('dist/assets', { recursive: true });
      await cp('assets', 'dist/assets', { recursive: true });
    },
  };
}

export default defineConfig({
  base: './',
  server: {
    port: 1420,
    strictPort: true,
  },
  clearScreen: false,
  plugins: [copyStaticAssets()],
});
