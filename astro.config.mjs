import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://reyzikuuu.github.io',
  base: '/reystore-trustedaffiliate',
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
    // sitemap(), // Dimatikan sementara karena ada bug pada plugin sitemap di Astro versi ini
  ],
  build: {
    assets: 'assets',
  },
});
