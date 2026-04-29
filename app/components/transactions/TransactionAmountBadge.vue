<script setup lang="ts">
const props = defineProps<{
  amount: number
  currency: string
}>()

const formatted = computed(() => {
  const abs = Math.abs(props.amount)
  const sign = props.amount >= 0 ? '+' : '-'
  return `${sign}${abs.toLocaleString('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${props.currency}`
})

const color = computed(() => (props.amount >= 0 ? 'success' : 'error'))
</script>

<template>
  <span
    :class="[
      'font-mono text-sm font-medium',
      amount >= 0 ? 'text-success-500' : 'text-error-500'
    ]"
  >
    {{ formatted }}
  </span>
</template>
