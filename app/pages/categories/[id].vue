<script setup lang="ts">
import { fetchCategoryById, updateCategory } from '~/services/categoryService'
import { fetchTransactionsByUserCategory } from '~/services/transactionService'
import type { UserCategory, UserCategoryRequest, TransactionResponse } from '~/types/transaction'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const id = Number(route.params.id)
const toast = useToast()

const category = ref<UserCategory | null>(null)
const catLoading = ref(true)

useSeoMeta({ title: computed(() => `${category.value?.name ?? 'Category'} — Financials Tracker`) })

// Edit state
const showEditModal = ref(false)
const saving = ref(false)
const form = reactive<UserCategoryRequest>({ name: '', color: '#6366f1', icon: '' })

function openEdit() {
  if (!category.value) return
  form.name = category.value.name
  form.color = category.value.color ?? '#6366f1'
  form.icon = category.value.icon ?? ''
  showEditModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    const payload: UserCategoryRequest = {
      name: form.name,
      color: form.color || undefined,
      icon: form.icon || undefined
    }
    category.value = await updateCategory(id, payload)
    showEditModal.value = false
    toast.add({ title: 'Category updated', color: 'success', icon: 'i-lucide-check' })
  } catch (err) {
    toast.add({ title: err instanceof Error ? err.message : 'Save failed', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    saving.value = false
  }
}

// Transactions
const transactions = ref<TransactionResponse[]>([])
const txLoading = ref(false)
const txTotalElements = ref(0)
const txTotalPages = ref(0)
const txPage = ref(0)
const txPageSize = 20

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

async function loadTransactions() {
  txLoading.value = true
  try {
    const result = await fetchTransactionsByUserCategory(id, { page: txPage.value, size: txPageSize })
    transactions.value = result.content
    txTotalElements.value = result.page.totalElements
    txTotalPages.value = result.page.totalPages
  } finally {
    txLoading.value = false
  }
}

onMounted(async () => {
  catLoading.value = true
  try {
    category.value = await fetchCategoryById(id)
  } finally {
    catLoading.value = false
  }
  await loadTransactions()
})
</script>

<template>
  <div class="contents">
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title="category?.name ?? 'Category'">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #right>
            <UButton
              icon="i-lucide-arrow-left"
              label="Back"
              variant="ghost"
              size="sm"
              @click="navigateTo('/categories')"
            />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <ClientOnly>
          <div class="flex flex-col gap-6 p-1">
            <!-- Category info card -->
            <UCard>
              <div
                v-if="catLoading"
                class="flex justify-center py-4"
              >
                <UIcon
                  name="i-lucide-loader-circle"
                  class="size-5 animate-spin text-muted"
                />
              </div>
              <div
                v-else-if="category"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="size-10 rounded-full flex items-center justify-center"
                    :style="{ backgroundColor: (category.color ?? '#888') + '22' }"
                  >
                    <UIcon
                      v-if="category.icon"
                      :name="`i-lucide-${category.icon}`"
                      class="size-5"
                      :style="{ color: category.color ?? '#888' }"
                    />
                    <span
                      v-else
                      class="size-4 rounded-full"
                      :style="{ backgroundColor: category.color ?? '#888' }"
                    />
                  </div>
                  <div>
                    <p class="font-semibold text-base">
                      {{ category.name }}
                    </p>
                    <p class="text-xs text-muted font-mono">
                      {{ category.color ?? '—' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UButton
                    icon="i-lucide-pencil"
                    label="Edit"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    @click="openEdit"
                  />
                </div>
              </div>
            </UCard>

            <!-- Transactions -->
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

    <!-- Edit modal -->
    <UModal
      v-model:open="showEditModal"
      title="Edit Category"
    >
      <template #body>
        <div class="flex flex-col gap-4">
          <UFormField
            label="Name"
            required
          >
            <UInput
              v-model="form.name"
              placeholder="e.g. Restaurants"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Color">
            <div class="flex items-center gap-2">
              <input
                v-model="form.color"
                type="color"
                class="size-9 rounded cursor-pointer border border-default"
              >
              <UInput
                v-model="form.color"
                placeholder="#6366f1"
                class="flex-1 font-mono"
              />
            </div>
          </UFormField>
          <UFormField label="Icon">
            <UInput
              v-model="form.icon"
              placeholder="e.g. shopping-cart"
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
            @click="showEditModal = false"
          />
          <UButton
            label="Save"
            :loading="saving"
            :disabled="!form.name.trim()"
            @click="handleSave"
          />
        </div>
      </template>
    </UModal>

    <TransactionsTransactionDetailModal
      v-model="showDetailModal"
      :transaction="selectedTransaction"
      @updated="onTransactionUpdated"
    />
  </div>
</template>
