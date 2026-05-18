<script setup lang="ts">
const props = defineProps<{
  value: number | null | undefined
  text: string
  currency: string | undefined
  loading: boolean
  icon: string
  type: 'NUMBER' | 'CURRENCY'
}>()
const { formatCurrency, formatNumber } = useFormatters()

const classNames = computed(() => {
  const baseClasses = 'text-2xl font-bold'
  if (props.loading) {
    return `${baseClasses} h-7 w-28 bg-muted animate-pulse rounded`
  }
  if (props.type === 'CURRENCY') {
    return `${baseClasses} ${
      (props.value ?? 0) >= 0 ? 'text-success' : 'text-error'
    }`
  }
  return baseClasses
})
</script>

<template>
  <UCard>
    <div class="flex items-start justify-between">
      <div>
        <p class="text-xs font-medium text-muted mb-1">
          {{ text }}
        </p>
        <p
          v-if="loading"
          class="h-7 w-28 bg-muted animate-pulse rounded"
        />
        <p
          v-else
          class="text-2xl font-bold"
          :class="classNames"
        >
          {{
            type === "CURRENCY"
              ? formatCurrency(value, currency)
              : formatNumber(value)
          }}
        </p>
      </div>
      <UIcon
        :name="icon"
        class="size-5 text-muted mt-0.5"
      />
    </div>
  </UCard>
</template>
