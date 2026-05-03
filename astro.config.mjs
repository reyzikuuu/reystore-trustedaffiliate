import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  // Ganti dengan custom domain nanti saat production (contoh: 'https://www.reystore.com')
  site: 'https://reystoreofficial.my.id',

  base: '/',
  output: "hybrid",

  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
    // sitemap(), // Dimatikan sementara karena ada bug pada plugin sitemap di Astro versi ini
  ],

  build: {
    assets: 'assets',
  },

  adapter: cloudflare()
});