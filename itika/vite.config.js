import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: 'itika-responder-network',
        name: 'Itika — First Responder Network',
        short_name: 'Itika',
        description: 'FemSaidia Kenya First Responder Network',
        theme_color: '#0A2A1A',
        background_color: '#0A2A1A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: 'https://itika.femsaidiakenya.org/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
