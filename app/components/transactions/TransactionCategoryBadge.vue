<script setup lang="ts">
import type { Category } from '~/types/transaction'

defineProps<{
  category: Category
}>()

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const COLOR_MAP: Record<Category, BadgeColor> = {
  TRADING: 'primary',
  CASH: 'info',
  DELIVERY: 'warning'
}
</script>

<template>
  <UBadge
    :color="COLOR_MAP[category]"
    :label="category"
    variant="outline"
    size="sm"
  />
</template>
