<script setup lang="ts">
  definePageMeta({ layout: false })
</script>

<template>
  <NuxtLink
    to="/dashboard"
    class="flex h-screen items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-primary transition-colors hover:bg-primary/20"
  >
    <UIcon name="i-lucide-trending-up" class="size-5" />
    <span class="font-medium">Go to Dashboard</span>
  </NuxtLink>
</template>
