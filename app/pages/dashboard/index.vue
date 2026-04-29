<script setup lang="ts">
import {
  fetchIncome,
  fetchOverview,
  fetchPortfolio,
  fetchSpending,
  fetchByAccount,
} from "~/services/dashboardService";

definePageMeta({ layout: "dashboard" });
useSeoMeta({ title: "Dashboard — Financials Tracker" });

const { data: overview, status: overviewStatus } = await useAsyncData(
  "dashboard-overview",
  fetchOverview,
  { server: false },
);
const { data: portfolio, status: portfolioStatus } = await useAsyncData(
  "dashboard-portfolio",
  fetchPortfolio,
  { server: false },
);
const { data: spending, status: spendingStatus } = await useAsyncData(
  "dashboard-spending",
  fetchSpending,
  { server: false },
);
const { data: income, status: incomeStatus } = await useAsyncData(
  "dashboard-income",
  fetchIncome,
  { server: false },
);
const { data: byAccount, status: byAccountStatus } = await useAsyncData(
  "dashboard-by-account",
  fetchByAccount,
  { server: false },
);

const activeTab = ref("all");

const tabs = computed(() => [
  { label: "All Accounts", value: "all" },
  ...(byAccount.value ?? []).map((a) => ({
    label: a.account.name,
    value: String(a.account.id),
  })),
]);

const activeEntry = computed(() =>
  activeTab.value === "all"
    ? null
    : ((byAccount.value ?? []).find(
        (a) => String(a.account.id) === activeTab.value,
      ) ?? null),
);

const activeOverview = computed(
  () => activeEntry.value?.overview ?? overview.value,
);
const activePortfolio = computed(
  () => activeEntry.value?.portfolio ?? portfolio.value,
);
const activeSpending = computed(
  () => activeEntry.value?.spending ?? spending.value,
);
const activeIncome = computed(() => activeEntry.value?.income ?? income.value);

const overviewLoading = computed(() =>
  activeTab.value === "all"
    ? overviewStatus.value === "pending"
    : byAccountStatus.value === "pending",
);
const portfolioLoading = computed(() =>
  activeTab.value === "all"
    ? portfolioStatus.value === "pending"
    : byAccountStatus.value === "pending",
);
const spendingLoading = computed(() =>
  activeTab.value === "all"
    ? spendingStatus.value === "pending"
    : byAccountStatus.value === "pending",
);
const incomeLoading = computed(() =>
  activeTab.value === "all"
    ? incomeStatus.value === "pending"
    : byAccountStatus.value === "pending",
);

function formatCurrency(value: number | undefined | null, currency = "EUR") {
  if (value == null) return "—";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(
    value,
  );
}

function formatNumber(value: number | undefined | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 4 }).format(
    value,
  );
}

const incomeBreakdown = computed(() => {
  if (!activeIncome.value) return [];
  return [
    {
      label: "Transfers Inbound",
      value: activeIncome.value.transferInbound,
      icon: "i-lucide-arrow-down-left",
    },
    {
      label: "Customer Inpayments",
      value: activeIncome.value.customerInpayments,
      icon: "i-lucide-users",
    },
    {
      label: "Dividends",
      value: activeIncome.value.dividends,
      icon: "i-lucide-trending-up",
    },
    {
      label: "Interest Payments",
      value: activeIncome.value.interestPayments,
      icon: "i-lucide-percent",
    },
    {
      label: "Bonuses",
      value: activeIncome.value.bonuses,
      icon: "i-lucide-gift",
    },
    {
      label: "Saveback",
      value: activeIncome.value.saveback,
      icon: "i-lucide-piggy-bank",
    },
  ];
});

const portfolioColumns = [
  { id: "symbol", header: "Symbol" },
  { id: "name", header: "Name" },
  { id: "totalShares", header: "Shares" },
  { id: "totalInvested", header: "Invested" },
  { id: "totalDividendsReceived", header: "Dividends" },
];

const merchantColumns = [
  { id: "rank", header: "#" },
  { id: "merchantName", header: "Merchant" },
  { id: "transactionCount", header: "Transactions" },
  { id: "totalSpent", header: "Total Spent" },
];

const merchantRows = computed(() =>
  (activeSpending.value?.topMerchants ?? []).map((m, i) => ({
    ...m,
    rank: i + 1,
  })),
);
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
          <!-- Account tabs -->
          <UTabs
            v-model="activeTab"
            :items="tabs"
            color="neutral"
            variant="link"
            value-key="value"
            label-key="label"
          />

          <!-- Overview cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <UCard>
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium text-muted mb-1">
                    Cash Balance
                  </p>
                  <p
                    v-if="overviewLoading"
                    class="h-7 w-28 bg-muted animate-pulse rounded"
                  />
                  <p
                    v-else
                    class="text-2xl font-bold"
                    :class="
                      (activeOverview?.cashBalance ?? 0) >= 0
                        ? 'text-success'
                        : 'text-error'
                    "
                  >
                    {{
                      formatCurrency(
                        activeOverview?.cashBalance,
                        activeOverview?.currency,
                      )
                    }}
                  </p>
                </div>
                <UIcon
                  name="i-lucide-wallet"
                  class="size-5 text-muted mt-0.5"
                />
              </div>
            </UCard>

            <UCard>
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium text-muted mb-1">
                    Total Transactions
                  </p>
                  <p
                    v-if="overviewLoading"
                    class="h-7 w-20 bg-muted animate-pulse rounded"
                  />
                  <p v-else class="text-2xl font-bold">
                    {{ formatNumber(activeOverview?.totalTransactionCount) }}
                  </p>
                </div>
                <UIcon
                  name="i-lucide-receipt"
                  class="size-5 text-muted mt-0.5"
                />
              </div>
            </UCard>

            <UCard>
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium text-muted mb-1">
                    Fees &amp; Taxes Paid
                  </p>
                  <p
                    v-if="overviewLoading"
                    class="h-7 w-24 bg-muted animate-pulse rounded"
                  />
                  <p v-else class="text-2xl font-bold text-error">
                    {{ formatCurrency(activeOverview?.totalFeesAndTaxesPaid) }}
                  </p>
                </div>
                <UIcon
                  name="i-lucide-landmark"
                  class="size-5 text-muted mt-0.5"
                />
              </div>
            </UCard>

            <UCard>
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium text-muted mb-1">
                    Total Income
                  </p>
                  <p
                    v-if="incomeLoading"
                    class="h-7 w-28 bg-muted animate-pulse rounded"
                  />
                  <p v-else class="text-2xl font-bold text-success">
                    {{ formatCurrency(activeIncome?.totalIncome) }}
                  </p>
                </div>
                <UIcon
                  name="i-lucide-trending-up"
                  class="size-5 text-muted mt-0.5"
                />
              </div>
            </UCard>
          </div>

          <!-- Income breakdown + Spending overview -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-lucide-circle-dollar-sign"
                    class="size-4 text-success"
                  />
                  <span class="font-semibold text-sm">Income Breakdown</span>
                </div>
              </template>

              <div v-if="incomeLoading" class="flex flex-col gap-3">
                <div
                  v-for="i in 6"
                  :key="i"
                  class="h-5 bg-muted animate-pulse rounded"
                />
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
                  <span class="text-sm font-medium tabular-nums">{{
                    formatCurrency(item.value)
                  }}</span>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-lucide-credit-card"
                    class="size-4 text-error"
                  />
                  <span class="font-semibold text-sm">Spending Overview</span>
                </div>
              </template>

              <div v-if="spendingLoading" class="flex flex-col gap-3">
                <div
                  v-for="i in 2"
                  :key="i"
                  class="h-5 bg-muted animate-pulse rounded"
                />
              </div>

              <div v-else class="flex flex-col gap-2">
                <div
                  class="flex items-center justify-between py-1.5 border-b border-default"
                >
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-credit-card"
                      class="size-4 text-muted"
                    />
                    <span class="text-sm">Card Spending</span>
                  </div>
                  <span class="text-sm font-medium tabular-nums text-error">{{
                    formatCurrency(activeSpending?.totalCardSpending)
                  }}</span>
                </div>
                <div class="flex items-center justify-between py-1.5">
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-arrow-up-right"
                      class="size-4 text-muted"
                    />
                    <span class="text-sm">Transfers Outbound</span>
                  </div>
                  <span class="text-sm font-medium tabular-nums text-error">{{
                    formatCurrency(activeSpending?.totalTransferOutbound)
                  }}</span>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Top merchants -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-store" class="size-4 text-primary" />
                <span class="font-semibold text-sm">Top Merchants</span>
              </div>
            </template>

            <div v-if="spendingLoading" class="flex flex-col gap-3">
              <div
                v-for="i in 5"
                :key="i"
                class="h-8 bg-muted animate-pulse rounded"
              />
            </div>

            <UTable v-else :data="merchantRows" :columns="merchantColumns">
              <template #rank-cell="{ row }">
                <span class="text-muted text-xs font-mono">{{
                  row.original.rank
                }}</span>
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
                <span class="tabular-nums text-error font-medium">{{
                  formatCurrency(row.original.totalSpent)
                }}</span>
              </template>
            </UTable>
          </UCard>

          <!-- Portfolio -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-lucide-bar-chart-2"
                    class="size-4 text-primary"
                  />
                  <span class="font-semibold text-sm">Portfolio</span>
                </div>
                <div
                  v-if="!portfolioLoading"
                  class="flex items-center gap-4 text-xs text-muted"
                >
                  <span
                    >Total invested:
                    <strong class="text-default">{{
                      formatCurrency(activePortfolio?.totalInvested)
                    }}</strong></span
                  >
                  <span
                    >Dividends received:
                    <strong class="text-success">{{
                      formatCurrency(activePortfolio?.totalDividendsReceived)
                    }}</strong></span
                  >
                </div>
              </div>
            </template>

            <div v-if="portfolioLoading" class="flex flex-col gap-3">
              <div
                v-for="i in 4"
                :key="i"
                class="h-8 bg-muted animate-pulse rounded"
              />
            </div>

            <UTable
              v-else
              :data="activePortfolio?.positions ?? []"
              :columns="portfolioColumns"
            >
              <template #symbol-cell="{ row }">
                <UBadge
                  :label="row.original.symbol"
                  color="primary"
                  variant="subtle"
                  size="sm"
                />
              </template>
              <template #name-cell="{ row }">
                <span class="font-medium">{{ row.original.name }}</span>
              </template>
              <template #totalShares-cell="{ row }">
                <span class="tabular-nums text-sm">{{
                  formatNumber(row.original.totalShares)
                }}</span>
              </template>
              <template #totalInvested-cell="{ row }">
                <span class="tabular-nums font-medium">{{
                  formatCurrency(row.original.totalInvested)
                }}</span>
              </template>
              <template #totalDividendsReceived-cell="{ row }">
                <span class="tabular-nums text-success">{{
                  formatCurrency(row.original.totalDividendsReceived)
                }}</span>
              </template>
            </UTable>
          </UCard>
        </div>
      </ClientOnly>
    </template>
  </UDashboardPanel>
</template>
