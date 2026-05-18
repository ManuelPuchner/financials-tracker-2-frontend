<script setup lang="ts">
import type { FxInfo } from '~/types/transaction'

defineProps<{ fxInfo: FxInfo }>()
</script>

<template>
  <div>
    <p class="text-xs text-muted uppercase tracking-wide mb-2">Foreign Exchange</p>
    <div class="grid grid-cols-2 gap-x-8 gap-y-2">
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-muted">Original Amount</span>
        <span class="text-sm font-mono">{{ fxInfo.originalAmount }} {{ fxInfo.originalCurrency }}</span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-muted">FX Rate</span>
        <span class="text-sm font-mono">{{ fxInfo.fxRate }}</span>
      </div>
    </div>
  </div>
</template>
