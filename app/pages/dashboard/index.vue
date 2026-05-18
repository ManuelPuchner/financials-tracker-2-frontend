<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Dashboard — Financials Tracker' })

const {
  activeTab,
  tabs,
  activeOverview,
  activePortfolio,
  activeSpending,
  activeIncome,
  overviewLoading,
  portfolioLoading,
  spendingLoading,
  incomeLoading,
} = useDashboard()
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <ClientOnly>
        <div class="flex flex-col gap-6 p-1">
          <UTabs
            v-model="activeTab"
            :items="tabs"
            color="neutral"
            variant="link"
            value-key="value"
            label-key="label"
          />

          <DashboardOverviewCards
            :overview="activeOverview"
            :income="activeIncome"
            :overview-loading="overviewLoading"
            :income-loading="incomeLoading"
          />

          <DashboardIncomeSpending
            :income="activeIncome"
            :spending="activeSpending"
            :income-loading="incomeLoading"
            :spending-loading="spendingLoading"
          />

          <DashboardTopMerchants
            :spending="activeSpending"
            :loading="spendingLoading"
          />

          <DashboardPortfolio
            :portfolio="activePortfolio"
            :loading="portfolioLoading"
          />
        </div>
      </ClientOnly>
    </template>
  </UDashboardPanel>
</template>
