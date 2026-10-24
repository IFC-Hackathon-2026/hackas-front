import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    open: '/',
  },
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'FarolFlow-logo-light.svg', 'FarolFlow-logo-dark.svg'],
      manifest: {
        id: '/',
        name: 'Farol Flow',
        short_name: 'Farol Flow',
        description: 'Organize eventos, projetos e tarefas com o Farol Flow.',
        lang: 'pt-BR',
        theme_color: '#01295F',
        background_color: '#F6F6F2',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/launchericon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/launchericon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
