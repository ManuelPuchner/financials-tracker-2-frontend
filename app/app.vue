<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'Financials' },
    { name: 'mobile-web-app-capable', content: 'yes' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' }
  ],
  htmlAttrs: { lang: 'en' }
})

useSeoMeta({
  title: 'Financials Tracker',
  description: 'Trade Republic transaction dashboard'
})
</script>

<template>
  <UApp>
    <NuxtPwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
