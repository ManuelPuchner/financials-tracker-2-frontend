<script setup lang="ts">
defineProps<{
  ownAccountName: string | null
  ownAccountIban: string | null
  paymentMethod: string | null
  sepaMandateId: string | null
  sepaCreditorId: string | null
  receiverReference: string | null
}>()
</script>

<template>
  <div>
    <p class="text-xs text-muted uppercase tracking-wide mb-2">
      Sparkasse Details
    </p>
    <div class="grid grid-cols-2 gap-x-8 gap-y-2">
      <div
        v-if="ownAccountName"
        class="flex flex-col gap-0.5"
      >
        <span class="text-xs text-muted">Account</span>
        <span class="text-sm">{{ ownAccountName }}</span>
      </div>
      <div
        v-if="ownAccountIban"
        class="flex flex-col gap-0.5"
      >
        <span class="text-xs text-muted">IBAN</span>
        <span class="text-sm font-mono">{{ ownAccountIban }}</span>
      </div>
      <div
        v-if="paymentMethod"
        class="flex flex-col gap-0.5"
      >
        <span class="text-xs text-muted">Payment Method</span>
        <span class="text-sm">{{ paymentMethod }}</span>
      </div>
      <div
        v-if="sepaMandateId"
        class="flex flex-col gap-0.5"
      >
        <span class="text-xs text-muted">SEPA Mandate ID</span>
        <span class="text-sm font-mono">{{ sepaMandateId }}</span>
      </div>
      <div
        v-if="sepaCreditorId"
        class="flex flex-col gap-0.5"
      >
        <span class="text-xs text-muted">SEPA Creditor ID</span>
        <span class="text-sm font-mono">{{ sepaCreditorId }}</span>
      </div>
      <div
        v-if="receiverReference"
        class="flex flex-col gap-0.5"
      >
        <span class="text-xs text-muted">Receiver Reference</span>
        <span class="text-sm font-mono">{{ receiverReference }}</span>
      </div>
    </div>
  </div>
</template>
