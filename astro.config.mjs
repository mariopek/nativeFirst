// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Fix: @astrojs/cloudflare incorrectly aliases react-dom/server to the browser
// bundle which uses MessageChannel (unavailable in Workers). This plugin corrects
// the alias to use the edge bundle instead.
function fixReactCloudflare() {
  return {
    name: 'fix-react-cloudflare',
    config(config) {
      const aliases = config.resolve?.alias;
      if (Array.isArray(aliases)) {
        const reactAlias = aliases.find((a) => a.find === 'react-dom/server');
        if (reactAlias) {
          reactAlias.replacement = 'react-dom/server.edge';
        }
      }
    },
  };
}

export default defineConfig({
  site: 'https://nativefirstapp.com',
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    mdx(),
    react(),
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss(), fixReactCloudflare()],
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
