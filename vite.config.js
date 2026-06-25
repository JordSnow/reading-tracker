import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.png', 'app-icon.png'],
    workbox: {
      maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15MB
      globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}']
    },
    manifest: {
      name: 'Reading Tracker',
      short_name: 'Reading',
      description: 'Your personal reading tracker',
      theme_color: '#0a0f1e',
      background_color: '#0a0f1e',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/app-icon.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/app-icon.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/app-icon.png',
          sizes: '180x180',
          type: 'image/png',
          purpose: 'apple touch icon'
        }
      ]
    }
  }), cloudflare()],
  optimizeDeps: {
    exclude: ['@electric-sql/pglite']
  },
  define: {
    process: {
      env: {},
    },
  },
})