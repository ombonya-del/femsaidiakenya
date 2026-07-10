import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      injectManifest: { injectionPoint: undefined },
      registerType: 'autoUpdate',
      manifest: {
        id: 'itika-command',
        name: 'Itika Command',
        short_name: 'Command',
        description: 'FemSaidia Kenya — Itika responder dispatch & coordination',
        theme_color: '#0A2A1A',
        background_color: '#071A0F',
        display: 'standalone',
        orientation: 'portrait',
        start_url: 'https://command.femsaidiakenya.org/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
