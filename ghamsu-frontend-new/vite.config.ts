import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
    sitemap({
      hostname: 'https://www.ghamsu.org', // Use hostname instead of baseUrl
      // The plugin only reads dynamicRoutes; this list was previously passed as
      // "routes", which it ignores, so the sitemap only contained "/".
      dynamicRoutes: [
        '/about',
        '/sermons',
        '/events',
        '/activities',
        '/boards',
        '/gallery',
        '/blogs',
        '/contact',
        '/partner',
      ],
      // The admin dashboard must not be indexed.
      robots: [{ userAgent: '*', allow: '/', disallow: '/admin' }],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})