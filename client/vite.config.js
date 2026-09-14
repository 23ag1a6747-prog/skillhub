import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        id: '/',
        name: 'SkillHub — Learn free. Build your resume.',
        short_name: 'SkillHub',
        description:
          'Discover free courses from YouTube, NPTEL, Coursera and edX, track your learning, and build an ATS-friendly resume.',
        theme_color: '#14171F',
        background_color: '#F6F5F1',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell + static assets: cache-first via precache (handled automatically).
        runtimeCaching: [
          {
            // Course + category API reads: network-first so data stays fresh online,
            // but falls back to cache when offline (course browsing/detail pages
            // also cache into IndexedDB separately for structured offline reads).
            urlPattern: ({ url, sameOrigin }) => !sameOrigin && /\/api\/(courses|categories)/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'skillhub-api-reads',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => /^https:\/\/fonts\.(googleapis|gstatic)\.com/.test(url.origin),
            handler: 'CacheFirst',
            options: {
              cacheName: 'skillhub-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: ({ url }) => /picsum\.photos/.test(url.origin),
            handler: 'CacheFirst',
            options: {
              cacheName: 'skillhub-thumbnails',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
})
