<script setup lang="ts">
import { fetchMerchant, fetchMerchantTransactions } from '~/services/merchantService'
import { fetchAccounts } from '~/services/accountService'
import type { MerchantResponse } from '~/types/entities'
import type { TransactionResponse, Account } from '~/types/transaction'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const name = decodeURIComponent(String(route.params.name))

useFormatters()

// Entity + stats
const merchant = ref<MerchantResponse | null>(null)
const mLoading = ref(true)

// Accounts for tabs
const accounts = ref<Account[]>([])
const activeTab = ref('all')
const tabs = computed(() => [
  { label: 'All Accounts', value: 'all' },
  ...accounts.value.map(a => ({ label: a.name, value: String(a.id) }))
])

const activeAccountId = computed(() =>
  activeTab.value === 'all' ? undefined : Number(activeTab.value)
)

// Transactions
const transactions = ref<TransactionResponse[]>([])
const txLoading = ref(false)
const txTotalElements = ref(0)
const txTotalPages = ref(0)
const txPage = ref(0)
const txPageSize = 20

useSeoMeta({ title: `${name} — Financials Tracker` })

async function loadMerchant() {
  mLoading.value = true
  try {
    merchant.value = await fetchMerchant(name, activeAccountId.value)
  } finally {
    mLoading.value = false
  }
}

async function loadTransactions() {
  txLoading.value = true
  try {
    const result = await fetchMerchantTransactions(name, activeAccountId.value, {
      page: txPage.value,
      size: txPageSize
    })
    transactions.value = result.content
    txTotalElements.value = result.page.totalElements
    txTotalPages.value = result.page.totalPages
  } finally {
    txLoading.value = false
  }
}

async function reload() {
  txPage.value = 0
  await Promise.all([loadMerchant(), loadTransactions()])
}

watch(activeTab, () => reload())

const showDetailModal = ref(false)
const selectedTransaction = ref<TransactionResponse | null>(null)

function openDetail(tx: TransactionResponse) {
  selectedTransaction.value = tx
  showDetailModal.value = true
}

function onTransactionUpdated(updated: TransactionResponse) {
  selectedTransaction.value = updated
  const idx = transactions.value.findIndex(t => t.id === updated.id)
  if (idx !== -1) transactions.value[idx] = updated
}

onMounted(async () => {
  accounts.value = await fetchAccounts()
  await reload()
})
</script>

<template>
  <div>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title="name">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #right>
            <UButton
              icon="i-lucide-arrow-left"
              label="Back"
              variant="ghost"
              size="sm"
              @click="navigateTo('/entities?tab=merchants')"
            />
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

            <!-- Stat cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardOverviewCard
                text="Total Income"
                :value="merchant?.stats.totalIncome"
                currency="EUR"
                :loading="mLoading"
                icon="i-lucide-trending-up"
                type="CURRENCY"
              />
              <DashboardOverviewCard
                text="Total Outgoing"
                :value="merchant ? -merchant.stats.totalOutgoing : null"
                currency="EUR"
                :loading="mLoading"
                icon="i-lucide-trending-down"
                type="CURRENCY"
              />
              <DashboardOverviewCard
                text="Net"
                :value="merchant?.stats.net"
                currency="EUR"
                :loading="mLoading"
                icon="i-lucide-scale"
                type="CURRENCY"
              />
              <DashboardOverviewCard
                text="Transactions"
                :value="merchant?.stats.transactionCount"
                currency="EUR"
                :loading="mLoading"
                icon="i-lucide-receipt"
                type="NUMBER"
              />
            </div>

            <!-- Transaction table -->
            <TransactionsTransactionTable
              :transactions="transactions"
              :loading="txLoading"
              :total-elements="txTotalElements"
              :total-pages="txTotalPages"
              :current-page="txPage"
              :page-size="txPageSize"
              @select="openDetail"
              @page-change="p => { txPage = p; loadTransactions() }"
            />
          </div>
        </ClientOnly>
      </template>
    </UDashboardPanel>

    <TransactionsTransactionDetailModal
      v-model="showDetailModal"
      :transaction="selectedTransaction"
      @updated="onTransactionUpdated"
    />
  </div>
</template>
