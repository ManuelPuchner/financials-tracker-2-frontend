<script setup lang="ts">
import type { DashboardSpending } from '~/types/dashboard'

const props = defineProps<{
  spending: DashboardSpending | null | undefined
  loading: boolean
}>()

const { formatCurrency } = useFormatters()

const columns = [
  { id: 'rank', header: '#' },
  { id: 'merchantName', header: 'Merchant' },
  { id: 'transactionCount', header: 'Transactions' },
  { id: 'totalSpent', header: 'Total Spent' }
]

const rows = computed(() =>
  (props.spending?.topMerchants ?? []).map((m, i) => ({ ...m, rank: i + 1 }))
)
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-store"
          class="size-4 text-primary"
        />
        <span class="font-semibold text-sm">Top Merchants</span>
      </div>
    </template>

    <div
      v-if="loading"
      class="flex flex-col gap-3"
    >
      <div
        v-for="i in 5"
        :key="i"
        class="h-8 bg-muted animate-pulse rounded"
      />
    </div>
    <UTable
      v-else
      :data="rows"
      :columns="columns"
    >
      <template #rank-cell="{ row }">
        <span class="text-muted text-xs font-mono">{{ row.original.rank }}</span>
      </template>
      <template #merchantName-cell="{ row }">
        <span class="font-medium">{{ row.original.merchantName }}</span>
      </template>
      <template #transactionCount-cell="{ row }">
        <UBadge
          :label="String(row.original.transactionCount)"
          color="neutral"
          variant="subtle"
          size="sm"
        />
      </template>
      <template #totalSpent-cell="{ row }">
        <span class="tabular-nums text-error font-medium">{{ formatCurrency(row.original.totalSpent) }}</span>
      </template>
    </UTable>
  </UCard>
</template>
