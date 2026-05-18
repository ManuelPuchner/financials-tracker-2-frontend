<script setup lang="ts">
import type { AssetInfo } from '~/types/transaction'

defineProps<{ assetInfo: AssetInfo, currency: string }>()
</script>

<template>
  <div>
    <p class="text-xs text-muted uppercase tracking-wide mb-2">
      Asset
    </p>
    <div class="grid grid-cols-2 gap-x-8 gap-y-2">
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-muted">Name</span>
        <span class="text-sm font-medium">{{ assetInfo.name }}</span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-muted">Symbol</span>
        <span class="text-sm font-mono">{{ assetInfo.symbol }}</span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-muted">Class</span>
        <span class="text-sm">{{ assetInfo.assetClass }}</span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-muted">Shares</span>
        <span class="text-sm font-mono">{{ assetInfo.shares }}</span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-muted">Price</span>
        <span class="text-sm font-mono">{{ assetInfo.price }} {{ currency }}</span>
      </div>
    </div>
  </div>
</template>
