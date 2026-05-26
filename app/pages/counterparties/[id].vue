<script setup lang="ts">
import { fetchCounterparty, fetchCounterpartyTransactions } from '~/services/counterpartyService'
import { fetchAccounts } from '~/services/accountService'
import { fetchMappingByCounterparty, upsertMapping, deleteMapping } from '~/services/counterpartyMerchantMappingService'
import type { CounterpartyResponse } from '~/types/entities'
import type { TransactionResponse, Account } from '~/types/transaction'
import type { CounterpartyMerchantMappingResponse } from '~/types/counterpartyMerchantMapping'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const id = Number(route.params.id)

useFormatters()

// Entity + stats
const counterparty = ref<CounterpartyResponse | null>(null)
const cpLoading = ref(true)

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

useSeoMeta({ title: computed(() => `${counterparty.value?.name ?? 'Counterparty'} — Financials Tracker`) })

async function loadCounterparty() {
  cpLoading.value = true
  try {
    counterparty.value = await fetchCounterparty(id, activeAccountId.value)
  } finally {
    cpLoading.value = false
  }
}

async function loadTransactions() {
  txLoading.value = true
  try {
    const result = await fetchCounterpartyTransactions(id, activeAccountId.value, {
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
  await Promise.all([loadCounterparty(), loadTransactions()])
}

watch(activeTab, () => reload())

// Merchant mapping
const mapping = ref<CounterpartyMerchantMappingResponse | null>(null)
const mappingInput = ref('')
const mappingSaving = ref(false)
const mappingDeleting = ref(false)
const toast = useToast()

async function loadMapping() {
  mapping.value = await fetchMappingByCounterparty(id)
  mappingInput.value = mapping.value?.merchantName ?? ''
}

async function saveMapping() {
  if (!mappingInput.value.trim()) return
  mappingSaving.value = true
  try {
    mapping.value = await upsertMapping(id, mappingInput.value.trim())
    toast.add({ title: 'Merchant mapping saved', color: 'success', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Failed to save mapping', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    mappingSaving.value = false
  }
}

async function removeMapping() {
  if (!mapping.value) return
  mappingDeleting.value = true
  try {
    await deleteMapping(mapping.value.id)
    mapping.value = null
    mappingInput.value = ''
    toast.add({ title: 'Merchant mapping removed', color: 'success', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Failed to remove mapping', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    mappingDeleting.value = false
  }
}

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
  await Promise.all([reload(), loadMapping()])
})
</script>

<template>
  <div class="contents">
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title="counterparty?.name ?? 'Counterparty'">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #right>
            <UButton
              icon="i-lucide-arrow-left"
              label="Back"
              variant="ghost"
              size="sm"
              @click="navigateTo('/entities')"
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

            <!-- IBAN info + merchant mapping -->
            <div class="flex flex-col gap-3">
              <p
                v-if="counterparty"
                class="text-sm text-muted font-mono"
              >
                IBAN: {{ counterparty.iban }}
              </p>

              <!-- Merchant mapping card -->
              <UCard>
                <div class="flex flex-col gap-3">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p class="text-sm font-medium">
                        Merchant Mapping
                      </p>
                      <p class="text-xs text-muted">
                        Map this counterparty to a merchant so all transactions appear together in the Merchants view.
                      </p>
                    </div>
                    <UBadge
                      v-if="mapping"
                      :label="mapping.merchantName"
                      color="success"
                      variant="subtle"
                      icon="i-lucide-link"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <UInput
                      v-model="mappingInput"
                      placeholder="Merchant name (e.g. Amazon)"
                      class="flex-1"
                      @keydown.enter="saveMapping"
                    />
                    <UButton
                      label="Save"
                      size="sm"
                      :loading="mappingSaving"
                      :disabled="!mappingInput.trim()"
                      @click="saveMapping"
                    />
                    <UButton
                      v-if="mapping"
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="ghost"
                      size="sm"
                      :loading="mappingDeleting"
                      @click="removeMapping"
                    />
                  </div>
                </div>
              </UCard>
            </div>

            <!-- Stat cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardOverviewCard
                text="Total Income"
                :value="counterparty?.stats.totalIncome"
                currency="EUR"
                :loading="cpLoading"
                icon="i-lucide-trending-up"
                type="CURRENCY"
              />
              <DashboardOverviewCard
                text="Total Outgoing"
                :value="counterparty ? -counterparty.stats.totalOutgoing : null"
                currency="EUR"
                :loading="cpLoading"
                icon="i-lucide-trending-down"
                type="CURRENCY"
              />
              <DashboardOverviewCard
                text="Net"
                :value="counterparty?.stats.net"
                currency="EUR"
                :loading="cpLoading"
                icon="i-lucide-scale"
                type="CURRENCY"
              />
              <DashboardOverviewCard
                text="Transactions"
                :value="counterparty?.stats.transactionCount"
                currency="EUR"
                :loading="cpLoading"
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
