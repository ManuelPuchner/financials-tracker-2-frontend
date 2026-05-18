<script setup lang="ts">
import type { DashboardOverview, DashboardIncome } from '~/types/dashboard'

defineProps<{
  overview: DashboardOverview | null | undefined
  income: DashboardIncome | null | undefined
  overviewLoading: boolean
  incomeLoading: boolean
}>()
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <DashboardOverviewCard
      text="Cash Balance"
      :value="overview?.cashBalance"
      :currency="overview?.currency"
      :loading="overviewLoading"
      :icon="'i-lucide-wallet'"
      type="CURRENCY"
    />

    <DashboardOverviewCard
      text="Total Transactions"
      :value="overview?.totalTransactionCount"
      :currency="overview?.currency"
      :loading="overviewLoading"
      :icon="'i-lucide-receipt'"
      type="NUMBER"
    />

    <DashboardOverviewCard
      text="Fees &amp; Taxes Paid"
      :value="(overview?.totalFeesAndTaxesPaid ?? 0) * -1"
      :currency="overview?.currency"
      :loading="overviewLoading"
      :icon="'i-lucide-landmark'"
      type="CURRENCY"
    />

    <DashboardOverviewCard
      text="Total Income"
      :value="income?.totalIncome"
      currency="EUR"
      :loading="incomeLoading"
      :icon="'i-lucide-trending-up'"
      type="CURRENCY"
    />
  </div>
</template>
