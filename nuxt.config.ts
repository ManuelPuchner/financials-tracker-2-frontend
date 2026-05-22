export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@vite-pwa/nuxt"],

  devtools: {
    enabled: true,
  },

  pwa: {
    devOptions: {
      enabled: false,
    },
    registerType: "autoUpdate", // Service Worker aktualisiert sich selbst
    manifest: {
      name: "Meine App",
      short_name: "MeineApp",
      description: "Beschreibung meiner App",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      lang: "de",
      icons: [
        {
          src: "pwa-64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
    client: {
      installPrompt: true,
    }
  },

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    // Override at runtime via NUXT_API_BASE_URL env var
    apiBaseUrl: "http://localhost:8080/api",
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
