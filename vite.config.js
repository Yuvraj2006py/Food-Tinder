import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
  server: {
    proxy: {
      // Browser → Overpass/Nominatim CORS in dev; production uses absolute URLs in src/lib/overpass.js
      '/api/overpass': {
        target: 'https://overpass-api.de',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/overpass/, '/api/interpreter'),
      },
      '/api/overpass-kumi': {
        target: 'https://overpass.kumi.systems',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/overpass-kumi/, '/api/interpreter'),
      },
      '/api/overpass-fr': {
        target: 'https://overpass.openstreetmap.fr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/overpass-fr/, '/api/interpreter'),
      },
      '/api/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nominatim/, ''),
      },
    },
  },
})
