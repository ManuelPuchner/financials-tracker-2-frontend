<script setup lang="ts">
import type { DashboardPortfolio } from '~/types/dashboard'

const props = defineProps<{
  portfolio: DashboardPortfolio | null | undefined
  loading: boolean
}>()

const { formatCurrency, formatNumber } = useFormatters()

const columns = [
  { id: 'symbol', header: 'Symbol' },
  { id: 'name', header: 'Name' },
  { id: 'totalShares', header: 'Shares' },
  { id: 'totalInvested', header: 'Invested' },
  { id: 'totalDividendsReceived', header: 'Dividends' },
]
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-bar-chart-2" class="size-4 text-primary" />
          <span class="font-semibold text-sm">Portfolio</span>
        </div>
        <div v-if="!loading" class="flex items-center gap-4 text-xs text-muted">
          <span>Total invested: <strong class="text-default">{{ formatCurrency(portfolio?.totalInvested) }}</strong></span>
          <span>Dividends received: <strong class="text-success">{{ formatCurrency(portfolio?.totalDividendsReceived) }}</strong></span>
        </div>
      </div>
    </template>

    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="i in 4" :key="i" class="h-8 bg-muted animate-pulse rounded" />
    </div>
    <UTable v-else :data="portfolio?.positions ?? []" :columns="columns">
      <template #symbol-cell="{ row }">
        <UBadge :label="row.original.symbol" color="primary" variant="subtle" size="sm" />
      </template>
      <template #name-cell="{ row }">
        <span class="font-medium">{{ row.original.name }}</span>
      </template>
      <template #totalShares-cell="{ row }">
        <span class="tabular-nums text-sm">{{ formatNumber(row.original.totalShares) }}</span>
      </template>
      <template #totalInvested-cell="{ row }">
        <span class="tabular-nums font-medium">{{ formatCurrency(row.original.totalInvested) }}</span>
      </template>
      <template #totalDividendsReceived-cell="{ row }">
        <span class="tabular-nums text-success">{{ formatCurrency(row.original.totalDividendsReceived) }}</span>
      </template>
    </UTable>
  </UCard>
</template>
