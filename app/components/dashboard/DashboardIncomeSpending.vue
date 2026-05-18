<script setup lang="ts">
import type { DashboardIncome, DashboardSpending } from '~/types/dashboard'

const props = defineProps<{
  income: DashboardIncome | null | undefined
  spending: DashboardSpending | null | undefined
  incomeLoading: boolean
  spendingLoading: boolean
}>()

const { formatCurrency } = useFormatters()

const incomeBreakdown = computed(() => {
  if (!props.income) return []
  return [
    { label: 'Transfers Inbound', value: props.income.transferInbound, icon: 'i-lucide-arrow-down-left' },
    { label: 'Customer Inpayments', value: props.income.customerInpayments, icon: 'i-lucide-users' },
    { label: 'Dividends', value: props.income.dividends, icon: 'i-lucide-trending-up' },
    { label: 'Interest Payments', value: props.income.interestPayments, icon: 'i-lucide-percent' },
    { label: 'Bonuses', value: props.income.bonuses, icon: 'i-lucide-gift' },
    { label: 'Saveback', value: props.income.saveback, icon: 'i-lucide-piggy-bank' },
  ]
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-circle-dollar-sign" class="size-4 text-success" />
          <span class="font-semibold text-sm">Income Breakdown</span>
        </div>
      </template>

      <div v-if="incomeLoading" class="flex flex-col gap-3">
        <div v-for="i in 6" :key="i" class="h-5 bg-muted animate-pulse rounded" />
      </div>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="item in incomeBreakdown"
          :key="item.label"
          class="flex items-center justify-between py-1.5 border-b border-default last:border-0"
        >
          <div class="flex items-center gap-2">
            <UIcon :name="item.icon" class="size-4 text-muted" />
            <span class="text-sm">{{ item.label }}</span>
          </div>
          <span class="text-sm font-medium tabular-nums">{{ formatCurrency(item.value) }}</span>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-credit-card" class="size-4 text-error" />
          <span class="font-semibold text-sm">Spending Overview</span>
        </div>
      </template>

      <div v-if="spendingLoading" class="flex flex-col gap-3">
        <div v-for="i in 2" :key="i" class="h-5 bg-muted animate-pulse rounded" />
      </div>
      <div v-else class="flex flex-col gap-2">
        <div class="flex items-center justify-between py-1.5 border-b border-default">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-credit-card" class="size-4 text-muted" />
            <span class="text-sm">Card Spending</span>
          </div>
          <span class="text-sm font-medium tabular-nums text-error">{{ formatCurrency(spending?.totalCardSpending) }}</span>
        </div>
        <div class="flex items-center justify-between py-1.5">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-arrow-up-right" class="size-4 text-muted" />
            <span class="text-sm">Transfers Outbound</span>
          </div>
          <span class="text-sm font-medium tabular-nums text-error">{{ formatCurrency(spending?.totalTransferOutbound) }}</span>
        </div>
      </div>
    </UCard>
  </div>
</template>
