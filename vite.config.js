import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      workbox: {
        // The Intel Brief PDF + its viewer are regenerated out-of-band by the
        // GitHub Action (not by an app rebuild). Keep the service worker out of
        // their way: never serve the SPA shell as a navigation fallback for them
        // (that was the "blank page until you refresh" bug), and never precache
        // the viewer html (that made it go stale after each publish).
        navigateFallbackDenylist: [/\.pdf$/, /intel-brief-latest-viewer\.html$/, /privacy\.html$/],
        globIgnores: ['**/intel-brief-latest-viewer.html', '**/intel-brief-latest.pdf'],
      },
      manifest: {
        name: 'FemSaidia Kenya',
        short_name: 'FemSaidia',
        description: 'Femicide Intelligence · Safety Tools · Community Response',
        theme_color: '#180410',
        background_color: '#D4BEC4',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  base: '/',
})
