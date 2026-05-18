<script setup lang="ts">
import type { CounterpartyInfo } from '~/types/transaction'

defineProps<{ counterpartyInfo: CounterpartyInfo }>()
</script>

<template>
  <div>
    <p class="text-xs text-muted uppercase tracking-wide mb-2">
      Counterparty
    </p>
    <div class="grid grid-cols-2 gap-x-8 gap-y-2">
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-muted">Name</span>
        <span class="text-sm">{{ counterpartyInfo.name }}</span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-muted">IBAN</span>
        <span class="text-sm font-mono">{{ counterpartyInfo.iban }}</span>
      </div>
      <div
        v-if="counterpartyInfo.paymentReference"
        class="flex flex-col gap-0.5 col-span-2"
      >
        <span class="text-xs text-muted">Reference</span>
        <span class="text-sm">{{ counterpartyInfo.paymentReference }}</span>
      </div>
    </div>
  </div>
</template>
