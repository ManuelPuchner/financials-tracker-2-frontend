<script setup lang="ts">
import { patchTransaction, deleteTransaction } from '~/services/transactionService'
import { fetchCategories } from '~/services/categoryService'
import type { TransactionResponse, UserCategory } from '~/types/transaction'

const props = defineProps<{
  transaction: TransactionResponse | null
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'updated': [transaction: TransactionResponse]
  'deleted': [transactionId: string]
}>()

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const toast = useToast()
const categories = ref<UserCategory[]>([])
const saving = ref(false)
const deleting = ref(false)
const confirmDelete = ref(false)

const categoryOptions = computed(() => [
  { label: 'None', value: null },
  ...categories.value.map(c => ({ label: c.name, value: c.id }))
])

const selectedCategoryId = ref<number | null>(null)
const editNote = ref<string>('')

watch(() => props.transaction, (tx) => {
  selectedCategoryId.value = tx?.userCategory?.id ?? null
  editNote.value = tx?.note ?? ''
  confirmDelete.value = false
})

onMounted(async () => {
  categories.value = await fetchCategories()
})

async function handleSave() {
  if (!props.transaction) return
  saving.value = true
  try {
    const updated = await patchTransaction(props.transaction.transactionId, {
      userCategoryId: selectedCategoryId.value,
      note: editNote.value.trim() || null
    })
    emit('updated', updated)
    toast.add({ title: 'Transaction updated', color: 'success', icon: 'i-lucide-check' })
  } catch (err) {
    toast.add({ title: err instanceof Error ? err.message : 'Failed to update', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!props.transaction) return
  deleting.value = true
  try {
    await deleteTransaction(props.transaction.transactionId)
    emit('deleted', props.transaction.transactionId)
    open.value = false
    toast.add({ title: 'Transaction deleted', color: 'success', icon: 'i-lucide-check' })
  } catch (err) {
    toast.add({ title: err instanceof Error ? err.message : 'Failed to delete', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    deleting.value = false
    confirmDelete.value = false
  }
}

function formatDateTime(dt: string): string {
  return new Date(dt).toLocaleString('de-AT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function formatAmount(value: number | null | undefined, currency: string): string {
  if (value == null) return '—'
  return `${value.toFixed(2)} ${currency}`
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="transaction ? `Transaction ${transaction.transactionId.slice(0, 8)}…` : 'Transaction'"
    :description="transaction ? formatDateTime(transaction.datetime) : ''"
    class="sm:max-w-2xl"
  >
    <template #body>
      <div
        v-if="transaction"
        class="flex flex-col gap-6"
      >
        <div class="grid grid-cols-2 gap-x-8 gap-y-3">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-muted uppercase tracking-wide">Source</span>
            <span class="text-sm font-medium">{{ transaction.source }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-muted uppercase tracking-wide">Type</span>
            <TransactionsTransactionTypeBadge :type="transaction.type" />
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-muted uppercase tracking-wide">Category</span>
            <TransactionsTransactionCategoryBadge :category="transaction.category" />
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-muted uppercase tracking-wide">Amount</span>
            <TransactionsTransactionAmountBadge
              :amount="transaction.amount"
              :currency="transaction.currency"
            />
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-muted uppercase tracking-wide">Fee</span>
            <span class="text-sm font-mono">{{ formatAmount(transaction.fee, transaction.currency) }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-muted uppercase tracking-wide">Tax</span>
            <span class="text-sm font-mono">{{ formatAmount(transaction.tax, transaction.currency) }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-muted uppercase tracking-wide">Account Type</span>
            <span class="text-sm">{{ transaction.accountType }}</span>
          </div>
          <div
            v-if="transaction.account"
            class="flex flex-col gap-0.5"
          >
            <span class="text-xs text-muted uppercase tracking-wide">Account</span>
            <div class="flex items-center gap-1.5">
              <span
                v-if="transaction.account.color"
                class="size-2.5 rounded-full shrink-0"
                :style="{ backgroundColor: transaction.account.color }"
              />
              <span class="text-sm">{{ transaction.account.name }}</span>
            </div>
          </div>
        </div>

        <USeparator />
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-2">
            <span class="text-xs text-muted uppercase tracking-wide">User Category</span>
            <USelectMenu
              v-model="selectedCategoryId"
              :items="categoryOptions"
              value-key="value"
              label-key="label"
              portal
            />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs text-muted uppercase tracking-wide">Note</span>
            <UInput
              v-model="editNote"
              placeholder="Add a note…"
            />
          </div>
          <div class="flex justify-end">
            <UButton
              label="Save changes"
              size="sm"
              :loading="saving"
              @click="handleSave"
            />
          </div>
        </div>

        <template v-if="transaction.description">
          <USeparator />
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-muted uppercase tracking-wide">Description</span>
            <span class="text-sm">{{ transaction.description }}</span>
          </div>
        </template>

        <template v-if="transaction.assetInfo">
          <USeparator />
          <div>
            <p class="text-xs text-muted uppercase tracking-wide mb-2">Asset</p>
            <div class="grid grid-cols-2 gap-x-8 gap-y-2">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs text-muted">Name</span>
                <span class="text-sm font-medium">{{ transaction.assetInfo.name }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-xs text-muted">Symbol</span>
                <span class="text-sm font-mono">{{ transaction.assetInfo.symbol }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-xs text-muted">Class</span>
                <span class="text-sm">{{ transaction.assetInfo.assetClass }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-xs text-muted">Shares</span>
                <span class="text-sm font-mono">{{ transaction.assetInfo.shares }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-xs text-muted">Price</span>
                <span class="text-sm font-mono">{{ transaction.assetInfo.price }} {{ transaction.currency }}</span>
              </div>
            </div>
          </div>
        </template>

        <template v-if="transaction.counterpartyInfo">
          <USeparator />
          <div>
            <p class="text-xs text-muted uppercase tracking-wide mb-2">Counterparty</p>
            <div class="grid grid-cols-2 gap-x-8 gap-y-2">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs text-muted">Name</span>
                <span class="text-sm">{{ transaction.counterpartyInfo.name }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-xs text-muted">IBAN</span>
                <span class="text-sm font-mono">{{ transaction.counterpartyInfo.iban }}</span>
              </div>
              <div
                v-if="transaction.counterpartyInfo.paymentReference"
                class="flex flex-col gap-0.5 col-span-2"
              >
                <span class="text-xs text-muted">Reference</span>
                <span class="text-sm">{{ transaction.counterpartyInfo.paymentReference }}</span>
              </div>
            </div>
          </div>
        </template>

        <template v-if="transaction.fxInfo">
          <USeparator />
          <div>
            <p class="text-xs text-muted uppercase tracking-wide mb-2">Foreign Exchange</p>
            <div class="grid grid-cols-2 gap-x-8 gap-y-2">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs text-muted">Original Amount</span>
                <span class="text-sm font-mono">{{ transaction.fxInfo.originalAmount }} {{ transaction.fxInfo.originalCurrency }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-xs text-muted">FX Rate</span>
                <span class="text-sm font-mono">{{ transaction.fxInfo.fxRate }}</span>
              </div>
            </div>
          </div>
        </template>

        <template v-if="transaction.merchantName || transaction.mccCode">
          <USeparator />
          <div class="grid grid-cols-2 gap-x-8 gap-y-2">
            <div
              v-if="transaction.merchantName"
              class="flex flex-col gap-0.5"
            >
              <span class="text-xs text-muted uppercase tracking-wide">Merchant</span>
              <span class="text-sm">{{ transaction.merchantName }}</span>
            </div>
            <div
              v-if="transaction.mccCode"
              class="flex flex-col gap-0.5"
            >
              <span class="text-xs text-muted uppercase tracking-wide">MCC Code</span>
              <span class="text-sm">
                <span class="font-mono">{{ transaction.mccCode.mcc }}</span>
                — {{ transaction.mccCode.description }}
              </span>
            </div>
          </div>
        </template>

        <template v-if="transaction.source === 'SPARKASSE' && (transaction.ownAccountIban || transaction.paymentMethod || transaction.sepaMandateId || transaction.sepaCreditorId)">
          <USeparator />
          <div>
            <p class="text-xs text-muted uppercase tracking-wide mb-2">Sparkasse Details</p>
            <div class="grid grid-cols-2 gap-x-8 gap-y-2">
              <div
                v-if="transaction.ownAccountName"
                class="flex flex-col gap-0.5"
              >
                <span class="text-xs text-muted">Account</span>
                <span class="text-sm">{{ transaction.ownAccountName }}</span>
              </div>
              <div
                v-if="transaction.ownAccountIban"
                class="flex flex-col gap-0.5"
              >
                <span class="text-xs text-muted">IBAN</span>
                <span class="text-sm font-mono">{{ transaction.ownAccountIban }}</span>
              </div>
              <div
                v-if="transaction.paymentMethod"
                class="flex flex-col gap-0.5"
              >
                <span class="text-xs text-muted">Payment Method</span>
                <span class="text-sm">{{ transaction.paymentMethod }}</span>
              </div>
              <div
                v-if="transaction.sepaMandateId"
                class="flex flex-col gap-0.5"
              >
                <span class="text-xs text-muted">SEPA Mandate ID</span>
                <span class="text-sm font-mono">{{ transaction.sepaMandateId }}</span>
              </div>
              <div
                v-if="transaction.sepaCreditorId"
                class="flex flex-col gap-0.5"
              >
                <span class="text-xs text-muted">SEPA Creditor ID</span>
                <span class="text-sm font-mono">{{ transaction.sepaCreditorId }}</span>
              </div>
            </div>
          </div>
        </template>

        <USeparator />
        <div class="flex flex-col gap-0.5">
          <span class="text-xs text-muted uppercase tracking-wide">Transaction ID</span>
          <span class="text-xs font-mono text-muted break-all">{{ transaction.transactionId }}</span>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between w-full gap-2">
        <div class="flex items-center gap-2">
          <UButton
            v-if="!confirmDelete"
            label="Delete"
            color="error"
            variant="ghost"
            size="sm"
            icon="i-lucide-trash-2"
            @click="confirmDelete = true"
          />
          <template v-else>
            <span class="text-sm text-error">Delete permanently?</span>
            <UButton
              label="Yes, delete"
              color="error"
              size="sm"
              :loading="deleting"
              @click="handleDelete"
            />
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="confirmDelete = false"
            />
          </template>
        </div>
        <UButton
          label="Close"
          color="neutral"
          variant="outline"
          @click="open = false"
        />
      </div>
    </template>
  </UModal>
</template>
