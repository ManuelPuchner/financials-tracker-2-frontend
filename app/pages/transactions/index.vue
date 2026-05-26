<script setup lang="ts">
import { fetchAccounts } from '~/services/accountService'
import { useTransactions } from '~/composables/useTransactions'
import type { Account, TransactionResponse } from '~/types/transaction'

definePageMeta({ layout: 'dashboard' })

useSeoMeta({ title: 'Transactions — Financials Tracker' })

const {
  transactions,
  totalElements,
  totalPages,
  loading,
  error,
  filters,
  load,
  resetFilters,
  goToPage
} = useTransactions()

// Account tabs
const accounts = ref<Account[]>([])
const activeTab = ref('all')

const tabs = computed(() => [
  { label: 'All', value: 'all' },
  ...accounts.value.map(a => ({ label: a.name, value: String(a.id) }))
])

watch(activeTab, (val) => {
  if (val === 'all') {
    filters.value.mode = 'all'
    filters.value.accountId = undefined
  } else {
    filters.value.mode = 'account'
    filters.value.accountId = Number(val)
  }
})

const showDetailModal = ref(false)
const selectedTransaction = ref<TransactionResponse | null>(null)

function openDetail(transaction: TransactionResponse) {
  selectedTransaction.value = transaction
  showDetailModal.value = true
}

function onTransactionUpdated(updated: TransactionResponse) {
  selectedTransaction.value = updated
  const idx = transactions.value.findIndex(t => t.id === updated.id)
  if (idx !== -1) transactions.value[idx] = updated
}

function onTransactionDeleted(transactionId: string) {
  transactions.value = transactions.value.filter(t => t.transactionId !== transactionId)
}

onMounted(async () => {
  accounts.value = await fetchAccounts()
  load()
})
</script>

<template>
  <div class="contents">
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar title="Transactions">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <div class="flex flex-col gap-4">
          <UTabs
            v-model="activeTab"
            :items="tabs"
            color="neutral"
            variant="link"
            value-key="value"
            label-key="label"
          />

          <TransactionsTransactionFilters
            v-model="filters"
            @reset="resetFilters"
          />

          <UAlert
            v-if="error"
            :title="error"
            color="error"
            variant="subtle"
            icon="i-lucide-alert-circle"
          />

          <TransactionsTransactionTable
            :transactions="transactions"
            :loading="loading"
            :total-elements="totalElements"
            :total-pages="totalPages"
            :current-page="filters.page"
            :page-size="filters.size"
            @select="openDetail"
            @page-change="goToPage"
          />
        </div>
      </template>
    </UDashboardPanel>

    <TransactionsTransactionDetailModal
      v-model="showDetailModal"
      :transaction="selectedTransaction"
      @updated="onTransactionUpdated"
      @deleted="onTransactionDeleted"
    />
  </div>
</template>
