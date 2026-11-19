import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tp9imka.dev',
  output: 'static',
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
});
