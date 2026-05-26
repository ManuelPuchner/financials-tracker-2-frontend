export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vite-pwa/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Override at runtime via NUXT_API_BASE_URL env var
    apiBaseUrl: 'http://localhost:8080/api'
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  pwa: {
    devOptions: {
      enabled: false
    },
    registerType: 'autoUpdate',
    manifest: {
      name: 'Financials Tracker',
      short_name: 'Financials',
      description: 'Personal finance dashboard for tracking transactions and investments',
      theme_color: '#18181b',
      background_color: '#18181b',
      display: 'standalone',
      start_url: '/',
      lang: 'en',
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true
    }
  }
})
