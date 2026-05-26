<script setup lang="ts">
import { fetchMerchants } from '~/services/merchantService'
import { fetchCounterparties } from '~/services/counterpartyService'
import { fetchCategories } from '~/services/categoryService'
import { fetchAccounts } from '~/services/accountService'
import { createTransaction } from '~/services/transactionService'
import type { Account, UserCategory, TransactionRequest } from '~/types/transaction'
import type { MerchantResponse, CounterpartyResponse } from '~/types/entities'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Bargeld — Financials Tracker' })

const toast = useToast()

// Mode: merchant or counterparty
type Mode = 'merchant' | 'counterparty'
const mode = ref<Mode>('merchant')

// Search
const searchTerm = ref('')
const searchLoading = ref(false)
const merchantResults = ref<MerchantResponse[]>([])
const counterpartyResults = ref<CounterpartyResponse[]>([])

const searchItems = computed(() => {
  if (mode.value === 'merchant') {
    return merchantResults.value.map(m => ({ label: m.name, value: m.name }))
  }
  return counterpartyResults.value.map(c => ({
    label: c.name ? `${c.name} — ${c.iban}` : c.iban,
    value: String(c.id),
    iban: c.iban,
    name: c.name ?? c.iban
  }))
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchTerm, (val) => {
  clearTimeout(searchTimeout)
  if (!val.trim()) {
    merchantResults.value = []
    counterpartyResults.value = []
    return
  }
  searchTimeout = setTimeout(() => doSearch(val.trim()), 250)
})

watch(mode, () => {
  searchTerm.value = ''
  selectedItem.value = undefined
  merchantResults.value = []
  counterpartyResults.value = []
})

async function doSearch(q: string) {
  searchLoading.value = true
  try {
    if (mode.value === 'merchant') {
      const res = await fetchMerchants({ size: 20 }, q)
      merchantResults.value = res.content
    } else {
      const res = await fetchCounterparties({ size: 20 }, q)
      counterpartyResults.value = res.content
    }
  } finally {
    searchLoading.value = false
  }
}

// Selected item
const selectedItem = ref<{ label: string, value: string, iban?: string, name?: string } | undefined>(undefined)

// New item modal
const showNewModal = ref(false)
const newName = ref('')
const newIban = ref('')

function openNewModal() {
  newName.value = searchTerm.value
  newIban.value = ''
  showNewModal.value = true
}

function confirmNew() {
  if (!newName.value.trim()) return
  if (mode.value === 'merchant') {
    selectedItem.value = { label: newName.value.trim(), value: newName.value.trim() }
  } else {
    const iban = newIban.value.trim()
    selectedItem.value = {
      label: iban ? `${newName.value.trim()} — ${iban}` : newName.value.trim(),
      value: '__new__',
      iban,
      name: newName.value.trim()
    }
  }
  searchTerm.value = selectedItem.value!.label
  showNewModal.value = false
}

// Accounts
const accounts = ref<Account[]>([])
type AccountOption = { label: string, value: number }
const selectedAccount = ref<number | undefined>(undefined)
const accountOptions = computed<AccountOption[]>(() =>
  accounts.value.map(a => ({ label: a.name, value: a.id }))
)
const resolvedAccountId = computed(() => selectedAccount.value)

// User categories
const userCategories = ref<UserCategory[]>([])
onMounted(async () => {
  [accounts.value, userCategories.value] = await Promise.all([fetchAccounts(), fetchCategories()])
  selectedAccount.value = accountOptions.value[0]?.value
})
const categoryOptions = computed(() =>
  userCategories.value.map(c => ({
    label: c.name,
    value: c.id,
    color: c.color,
    icon: c.icon ? `i-lucide-${c.icon}` : undefined
  }))
)

// Form
type Direction = 'outgoing' | 'incoming'
const direction = ref<Direction>('outgoing')

const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  date: today,
  amount: undefined as number | undefined,
  currency: 'EUR',
  description: '',
  userCategoryId: undefined as number | undefined
})

const submitting = ref(false)

async function handleSubmit() {
  if (!selectedItem.value) {
    toast.add({ title: 'Please select or add a merchant / counterparty', color: 'error', icon: 'i-lucide-alert-circle' })
    return
  }
  if (form.amount === undefined || form.amount === null) {
    toast.add({ title: 'Please enter an amount', color: 'error', icon: 'i-lucide-alert-circle' })
    return
  }

  const datetime = `${form.date}T12:00:00Z`

  const request: TransactionRequest & { userCategoryId?: number } = {
    transactionId: crypto.randomUUID(),
    accountId: resolvedAccountId.value,
    transactionSource: 'BARGELD',
    datetime,
    date: form.date,
    accountType: 'DEFAULT',
    category: 'CASH',
    type: mode.value === 'merchant'
      ? 'CARD_TRANSACTION'
      : direction.value === 'incoming' ? 'TRANSFER_INBOUND' : 'TRANSFER_INSTANT_OUTBOUND',
    amount: direction.value === 'outgoing' ? -Math.abs(form.amount) : Math.abs(form.amount),
    currency: form.currency,
    description: form.description || undefined,
    ...(mode.value === 'merchant'
      ? { merchantName: selectedItem.value.label }
      : {
          counterpartyName: selectedItem.value.name ?? selectedItem.value.label,
          counterpartyIban: selectedItem.value.iban || undefined
        }
    )
  }

  submitting.value = true
  try {
    const tx = await createTransaction(request)

    // patch user category if selected
    if (form.userCategoryId) {
      const { patchTransaction } = await import('~/services/transactionService')
      await patchTransaction(tx.transactionId, { userCategoryId: form.userCategoryId })
    }

    toast.add({ title: 'Transaction created', color: 'success', icon: 'i-lucide-check' })
    resetForm()
  } catch (err) {
    toast.add({ title: err instanceof Error ? err.message : 'Failed to create', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  direction.value = 'outgoing'
  selectedAccount.value = accountOptions.value[0]?.value
  form.date = new Date().toISOString().slice(0, 10)
  form.amount = undefined
  form.description = ''
  form.userCategoryId = undefined
  selectedItem.value = undefined
  searchTerm.value = ''
  merchantResults.value = []
  counterpartyResults.value = []
}
</script>

<template>
  <div class="contents">
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar title="Bargeld">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <div class="max-w-xl">
          <UCard>
            <div class="flex flex-col gap-6">
              <!-- Mode toggle -->
              <div class="flex rounded-lg border border-default overflow-hidden">
                <button
                  class="flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
                  :class="mode === 'merchant' ? 'bg-primary text-white' : 'text-muted hover:bg-elevated'"
                  @click="mode = 'merchant'"
                >
                  <UIcon
                    name="i-lucide-store"
                    class="size-4"
                  />
                  Merchant
                </button>
                <div class="w-px bg-default" />
                <button
                  class="flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
                  :class="mode === 'counterparty' ? 'bg-primary text-white' : 'text-muted hover:bg-elevated'"
                  @click="mode = 'counterparty'"
                >
                  <UIcon
                    name="i-lucide-user"
                    class="size-4"
                  />
                  Counterparty
                </button>
              </div>

              <USeparator />

              <!-- Merchant / counterparty selector -->
              <UFormField
                :label="mode === 'merchant' ? 'Merchant' : 'Counterparty'"
                required
              >
                <div class="flex gap-2">
                  <UInputMenu
                    v-model="selectedItem"
                    v-model:search-term="searchTerm"
                    :items="searchItems"
                    :loading="searchLoading"
                    label-key="label"
                    :placeholder="`Search ${mode === 'merchant' ? 'merchant' : 'counterparty'}…`"
                    class="flex-1"
                  />
                  <UTooltip :text="`Add new ${mode === 'merchant' ? 'merchant' : 'counterparty'}`">
                    <UButton
                      icon="i-lucide-plus"
                      color="neutral"
                      variant="outline"
                      @click="openNewModal"
                    />
                  </UTooltip>
                </div>
              </UFormField>

              <!-- Selected indicator — outside the form field so it has full card width -->
              <div
                v-if="selectedItem"
                class="flex items-center gap-3 px-4 py-3 rounded-lg bg-success/10 border border-success/20"
              >
                <UIcon
                  name="i-lucide-check-circle"
                  class="size-5 text-success shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">
                    {{ selectedItem.name ?? selectedItem.label }}
                  </p>
                  <p
                    v-if="selectedItem.iban"
                    class="text-xs text-muted font-mono mt-0.5"
                  >
                    {{ selectedItem.iban }}
                  </p>
                </div>
                <UButton
                  icon="i-lucide-x"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  @click="selectedItem = undefined; searchTerm = ''"
                />
              </div>

              <!-- Date + Amount + Currency row -->
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <UFormField
                  label="Date"
                  required
                  class="col-span-2 sm:col-span-2"
                >
                  <UInput
                    v-model="form.date"
                    type="date"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Amount"
                  required
                  class="col-span-2 sm:col-span-2"
                >
                  <div class="flex rounded-lg border border-default overflow-hidden">
                    <button
                      class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-r border-default"
                      :class="direction === 'outgoing' ? 'bg-error/15 text-error' : 'text-muted hover:bg-elevated'"
                      @click="direction = 'outgoing'"
                    >
                      <UIcon
                        name="i-lucide-arrow-up"
                        class="size-3.5"
                      />
                      Out
                    </button>
                    <button
                      class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-r border-default"
                      :class="direction === 'incoming' ? 'bg-success/15 text-success' : 'text-muted hover:bg-elevated'"
                      @click="direction = 'incoming'"
                    >
                      <UIcon
                        name="i-lucide-arrow-down"
                        class="size-3.5"
                      />
                      In
                    </button>
                    <input
                      v-model.number="form.amount"
                      type="number"
                      step="0.01"
                      placeholder="12.50"
                      class="flex-1 min-w-0 bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-muted"
                    >
                  </div>
                </UFormField>
                <UFormField
                  label="Currency"
                  class="col-span-2 sm:col-span-1"
                >
                  <UInput
                    v-model="form.currency"
                    placeholder="EUR"
                    maxlength="3"
                    class="w-full font-mono"
                  />
                </UFormField>
              </div>

              <!-- Account + Category + Description row -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <UFormField
                  label="Account"
                  required
                >
                  <USelect
                    v-model="selectedAccount"
                    :items="accountOptions"
                    value-key="value"
                    label-key="label"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Category">
                  <USelect
                    v-model="form.userCategoryId"
                    :items="categoryOptions"
                    value-key="value"
                    label-key="label"
                    placeholder="None"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Description">
                  <UInput
                    v-model="form.description"
                    placeholder="Optional note…"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <USeparator />

              <!-- Submit -->
              <UButton
                label="Create Transaction"
                icon="i-lucide-banknote"
                :loading="submitting"
                size="lg"
                class="w-full justify-center"
                @click="handleSubmit"
              />
            </div>
          </UCard>
        </div>
      </template>
    </UDashboardPanel>

    <!-- New merchant / counterparty modal -->
    <UModal
      v-model:open="showNewModal"
      :title="`Add New ${mode === 'merchant' ? 'Merchant' : 'Counterparty'}`"
    >
      <template #body>
        <div class="flex flex-col gap-4">
          <UFormField
            label="Name"
            required
          >
            <UInput
              v-model="newName"
              placeholder="e.g. Billa"
              class="w-full"
              autofocus
            />
          </UFormField>
          <UFormField
            v-if="mode === 'counterparty'"
            label="IBAN"
          >
            <UInput
              v-model="newIban"
              placeholder="AT83…"
              class="w-full font-mono"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="outline"
            @click="showNewModal = false"
          />
          <UButton
            label="Add"
            :disabled="!newName.trim()"
            @click="confirmNew"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
