<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { fetchCounterparties } from '~/services/counterpartyService'
import { fetchMerchants } from '~/services/merchantService'
import { fetchAssets } from '~/services/assetService'
import type { CounterpartyResponse, MerchantResponse, AssetResponse } from '~/types/entities'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Entities — Financials Tracker' })

const { formatCurrency, formatNumber } = useFormatters()

const activeTab = ref('counterparties')
const entityTabs = [
  { label: 'Counterparties', value: 'counterparties' },
  { label: 'Merchants', value: 'merchants' },
  { label: 'Assets', value: 'assets' },
]

// --- Counterparties ---
const counterparties = ref<CounterpartyResponse[]>([])
const cpLoading = ref(false)
const cpTotalElements = ref(0)
const cpTotalPages = ref(0)
const cpPage = ref(0)
const cpPageSize = 20

type CpFilter = 'all' | 'bank' | 'cash'
const cpFilter = ref<CpFilter>('all')
const cpFilterItems: { label: string, value: CpFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Bank', value: 'bank' },
  { label: 'Cash', value: 'cash' },
]

const cpIbanPrefix = computed<string | undefined>(() => {
  if (cpFilter.value === 'cash') return 'CS00CASH'
  return undefined
})

watch(cpFilter, () => { cpPage.value = 0; loadCounterparties() })

async function loadCounterparties() {
  cpLoading.value = true
  try {
    const result = await fetchCounterparties({ page: cpPage.value, size: cpPageSize }, undefined, cpIbanPrefix.value)
    // bank filter: client-side exclude cash IBANs (backend has no "NOT prefix" support)
    const rows = cpFilter.value === 'bank'
      ? result.content.filter(c => !c.iban.startsWith('CS00CASH'))
      : result.content
    counterparties.value = rows
    cpTotalElements.value = result.page.totalElements
    cpTotalPages.value = result.page.totalPages
  } finally {
    cpLoading.value = false
  }
}

const counterpartyColumns: TableColumn<CounterpartyResponse>[] = [
  { id: 'name', header: 'Name' },
  { id: 'iban', header: 'IBAN' },
  { id: 'income', header: 'Income' },
  { id: 'outgoing', header: 'Outgoing' },
  { id: 'net', header: 'Net' },
  { id: 'count', header: 'Transactions' },
  { id: 'actions', header: '' },
]

// --- Merchants ---
const merchants = ref<MerchantResponse[]>([])
const mLoading = ref(false)
const mTotalElements = ref(0)
const mTotalPages = ref(0)
const mPage = ref(0)
const mPageSize = 20

async function loadMerchants() {
  mLoading.value = true
  try {
    const result = await fetchMerchants({ page: mPage.value, size: mPageSize })
    merchants.value = result.content
    mTotalElements.value = result.page.totalElements
    mTotalPages.value = result.page.totalPages
  } finally {
    mLoading.value = false
  }
}

const merchantColumns: TableColumn<MerchantResponse>[] = [
  { id: 'name', header: 'Name' },
  { id: 'income', header: 'Income' },
  { id: 'outgoing', header: 'Outgoing' },
  { id: 'net', header: 'Net' },
  { id: 'count', header: 'Transactions' },
  { id: 'actions', header: '' },
]

// --- Assets ---
const assets = ref<AssetResponse[]>([])
const aLoading = ref(false)
const aTotalElements = ref(0)
const aTotalPages = ref(0)
const aPage = ref(0)
const aPageSize = 20

async function loadAssets() {
  aLoading.value = true
  try {
    const result = await fetchAssets({ page: aPage.value, size: aPageSize })
    assets.value = result.content
    aTotalElements.value = result.page.totalElements
    aTotalPages.value = result.page.totalPages
  } finally {
    aLoading.value = false
  }
}

const assetColumns: TableColumn<AssetResponse>[] = [
  { id: 'symbol', header: 'Symbol' },
  { id: 'name', header: 'Name' },
  { id: 'assetClass', header: 'Class' },
  { id: 'income', header: 'Income' },
  { id: 'outgoing', header: 'Outgoing' },
  { id: 'net', header: 'Net' },
  { id: 'count', header: 'Transactions' },
  { id: 'actions', header: '' },
]

onMounted(() => {
  loadCounterparties()
  loadMerchants()
  loadAssets()
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Entities">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 p-1">
        <UTabs
          v-model="activeTab"
          :items="entityTabs"
          color="neutral"
          variant="link"
          value-key="value"
          label-key="label"
        />

        <!-- Counterparties -->
        <template v-if="activeTab === 'counterparties'">
          <div class="flex items-center gap-2">
            <div class="flex rounded-lg border border-default overflow-hidden">
              <button
                v-for="item in cpFilterItems"
                :key="item.value"
                class="px-3 py-1.5 text-sm font-medium transition-colors border-r border-default last:border-0"
                :class="cpFilter === item.value ? 'bg-primary text-white' : 'text-muted hover:bg-elevated'"
                @click="cpFilter = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>

          <UTable
            :columns="counterpartyColumns"
            :data="counterparties"
            :loading="cpLoading"
          >
            <template #name-cell="{ row }">
              <span class="font-medium">{{ row.original.name ?? '—' }}</span>
            </template>
            <template #iban-cell="{ row }">
              <span class="font-mono text-xs text-muted">{{ row.original.iban }}</span>
            </template>
            <template #income-cell="{ row }">
              <span class="text-success">{{ formatCurrency(row.original.stats.totalIncome) }}</span>
            </template>
            <template #outgoing-cell="{ row }">
              <span class="text-error">{{ formatCurrency(row.original.stats.totalOutgoing) }}</span>
            </template>
            <template #net-cell="{ row }">
              <span :class="row.original.stats.net >= 0 ? 'text-success' : 'text-error'">
                {{ formatCurrency(row.original.stats.net) }}
              </span>
            </template>
            <template #count-cell="{ row }">
              {{ formatNumber(row.original.stats.transactionCount) }}
            </template>
            <template #actions-cell="{ row }">
              <UButton
                icon="i-lucide-arrow-right"
                variant="ghost"
                size="xs"
                @click.stop="navigateTo(`/counterparties/${row.original.id}`)"
              />
            </template>
          </UTable>
          <UPagination
            v-if="cpTotalPages > 1"
            :page="cpPage + 1"
            :total="cpTotalElements"
            :items-per-page="cpPageSize"
            @update:page="p => { cpPage = p - 1; loadCounterparties() }"
          />
        </template>

        <!-- Merchants -->
        <template v-if="activeTab === 'merchants'">
          <UTable
            :columns="merchantColumns"
            :data="merchants"
            :loading="mLoading"
          >
            <template #name-cell="{ row }">
              <span class="font-medium">{{ row.original.name }}</span>
            </template>
            <template #income-cell="{ row }">
              <span class="text-success">{{ formatCurrency(row.original.stats.totalIncome) }}</span>
            </template>
            <template #outgoing-cell="{ row }">
              <span class="text-error">{{ formatCurrency(row.original.stats.totalOutgoing) }}</span>
            </template>
            <template #net-cell="{ row }">
              <span :class="row.original.stats.net >= 0 ? 'text-success' : 'text-error'">
                {{ formatCurrency(row.original.stats.net) }}
              </span>
            </template>
            <template #count-cell="{ row }">
              {{ formatNumber(row.original.stats.transactionCount) }}
            </template>
            <template #actions-cell="{ row }">
              <UButton
                icon="i-lucide-arrow-right"
                variant="ghost"
                size="xs"
                @click.stop="navigateTo(`/merchants/${encodeURIComponent(row.original.name)}`)"
              />
            </template>
          </UTable>
          <UPagination
            v-if="mTotalPages > 1"
            :page="mPage + 1"
            :total="mTotalElements"
            :items-per-page="mPageSize"
            @update:page="p => { mPage = p - 1; loadMerchants() }"
          />
        </template>

        <!-- Assets -->
        <template v-if="activeTab === 'assets'">
          <UTable
            :columns="assetColumns"
            :data="assets"
            :loading="aLoading"
          >
            <template #symbol-cell="{ row }">
              <span class="font-mono font-medium">{{ row.original.symbol }}</span>
            </template>
            <template #name-cell="{ row }">
              {{ row.original.name }}
            </template>
            <template #assetClass-cell="{ row }">
              <UBadge :label="row.original.assetClass" variant="subtle" size="sm" />
            </template>
            <template #income-cell="{ row }">
              <span class="text-success">{{ formatCurrency(row.original.stats.totalIncome) }}</span>
            </template>
            <template #outgoing-cell="{ row }">
              <span class="text-error">{{ formatCurrency(row.original.stats.totalOutgoing) }}</span>
            </template>
            <template #net-cell="{ row }">
              <span :class="row.original.stats.net >= 0 ? 'text-success' : 'text-error'">
                {{ formatCurrency(row.original.stats.net) }}
              </span>
            </template>
            <template #count-cell="{ row }">
              {{ formatNumber(row.original.stats.transactionCount) }}
            </template>
            <template #actions-cell="{ row }">
              <UButton
                icon="i-lucide-arrow-right"
                variant="ghost"
                size="xs"
                @click.stop="navigateTo(`/assets/${row.original.id}`)"
              />
            </template>
          </UTable>
          <UPagination
            v-if="aTotalPages > 1"
            :page="aPage + 1"
            :total="aTotalElements"
            :items-per-page="aPageSize"
            @update:page="p => { aPage = p - 1; loadAssets() }"
          />
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
