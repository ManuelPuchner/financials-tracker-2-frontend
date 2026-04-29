<script setup lang="ts">
import { useTransactions } from '~/composables/useTransactions'
import type { TransactionResponse } from '~/types/transaction'

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

const showDetailModal = ref(false)
const selectedTransaction = ref<TransactionResponse | null>(null)
const showCreateModal = ref(false)

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

function onTransactionCreated() {
  load()
}

onMounted(() => load())
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Transactions">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="Add Transaction"
            icon="i-lucide-plus"
            size="sm"
            @click="showCreateModal = true"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4">
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

  <TransactionsTransactionCreateModal
    v-model:open="showCreateModal"
    @created="onTransactionCreated"
  />
</template>
