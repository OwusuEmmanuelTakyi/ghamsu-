import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
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
      baseUrl: 'https://gmsu.org', // Change to your actual domain
      dynamicRoutes: [
        {
          url: '/',
          changefreq: 'weekly',
          priority: 1.0,
        },
        {
          url: '/about',
          changefreq: 'monthly',
          priority: 0.9,
        },
        {
          url: '/sermons',
          changefreq: 'weekly',
          priority: 0.9,
        },
        {
          url: '/events',
          changefreq: 'weekly',
          priority: 0.9,
        },
        {
          url: '/boards',
          changefreq: 'monthly',
          priority: 0.8,
        },
        {
          url: '/gallery',
          changefreq: 'weekly',
          priority: 0.8,
        },
        {
          url: '/blogs',
          changefreq: 'weekly',
          priority: 0.9,
        },
        {
          url: '/contact',
          changefreq: 'monthly',
          priority: 0.8,
        },
        {
          url: '/partner',
          changefreq: 'monthly',
          priority: 0.8,
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})