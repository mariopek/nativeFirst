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
  // Static-by-default (hybrid): only routes that opt in with `prerender = false`
  // (API endpoints, deck OG pages, AASA) are bundled into the Cloudflare Worker.
  // This keeps the Worker under Cloudflare's 3 MiB limit as blog content grows —
  // previously `output: 'server'` bundled every route + all content into the
  // Worker, which pushed it past the limit and failed every deploy.
  output: 'static',
  adapter: cloudflare(),
  redirects: {
    '/apps/applyiq': '/apps/rolebud',
    '/blog/how-ats-systems-work-applyiq': '/blog/how-ats-systems-work-rolebud',
  },
  integrations: [
    mdx(),
    react(),
    sitemap({
      filter: (page) => !page.includes('/api/') && !page.includes('/experiment/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
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
