<script setup lang="ts">
import { useCreateTransaction } from '~/composables/useCreateTransaction'
import { ASSET_CLASSES, CATEGORIES, TRANSACTION_TYPES } from '~/types/transaction'
import type { AssetClass, Category, TransactionRequest, TransactionType } from '~/types/transaction'

const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { loading, error, submit } = useCreateTransaction()
const toast = useToast()

const form = ref<TransactionRequest>({
  transactionId: '',
  datetime: '',
  date: '',
  accountType: 'DEFAULT',
  category: 'TRADING',
  type: 'BUY',
  amount: 0,
  currency: 'EUR'
})

const categoryOptions = CATEGORIES.map((c) => ({ label: c, value: c }))
const typeOptions = TRANSACTION_TYPES.map((t) => ({ label: t.replace(/_/g, ' '), value: t }))
const assetClassOptions = ASSET_CLASSES.map((a) => ({ label: a, value: a }))

const showAssetFields = computed(() =>
  form.value.category === 'TRADING'
  || form.value.type === 'DIVIDEND'
  || form.value.type === 'STOCKPERK'
  || form.value.type === 'MIGRATION'
)

const showCounterpartyFields = computed(() =>
  form.value.type === 'CUSTOMER_INBOUND'
  || form.value.type === 'TRANSFER_INBOUND'
  || form.value.type === 'TRANSFER_INSTANT_INBOUND'
  || form.value.type === 'TRANSFER_INSTANT_OUTBOUND'
)

const showCardFields = computed(() =>
  form.value.type === 'CARD_TRANSACTION'
  || form.value.type === 'CARD_TRANSACTION_INTERNATIONAL'
)

const showFxFields = computed(() =>
  form.value.type === 'CARD_TRANSACTION_INTERNATIONAL'
)

async function handleSubmit() {
  const result = await submit(form.value)
  if (result) {
    toast.add({ title: 'Transaction created', color: 'success', icon: 'i-lucide-check' })
    open.value = false
    emit('created')
    resetForm()
  }
}

function resetForm() {
  form.value = {
    transactionId: '',
    datetime: '',
    date: '',
    accountType: 'DEFAULT',
    category: 'TRADING',
    type: 'BUY',
    amount: 0,
    currency: 'EUR'
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Add Transaction"
    description="Manually add a single transaction"
    class="sm:max-w-2xl"
  >
    <template #body>
      <form
        class="flex flex-col gap-5"
        @submit.prevent="handleSubmit"
      >
        <UAlert
          v-if="error"
          :title="error"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
        />

        <div class="grid grid-cols-2 gap-4">
          <UFormField
            label="Transaction ID (UUID)"
            class="col-span-2"
            required
          >
            <UInput
              v-model="form.transactionId"
              placeholder="ed915aa4-c463-4b3d-bafa-92b54245d5e4"
              class="font-mono w-full"
              required
            />
          </UFormField>

          <UFormField
            label="Datetime (UTC)"
            required
          >
            <UInput
              v-model="form.datetime"
              type="datetime-local"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Date"
            required
          >
            <UInput
              v-model="form.date"
              type="date"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Category"
            required
          >
            <USelect
              v-model="form.category"
              :items="categoryOptions"
              value-key="value"
              label-key="label"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Type"
            required
          >
            <USelect
              v-model="form.type"
              :items="typeOptions"
              value-key="value"
              label-key="label"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Amount"
            required
          >
            <UInput
              v-model.number="form.amount"
              type="number"
              step="0.01"
              placeholder="-30.00"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField label="Currency">
            <UInput
              v-model="form.currency"
              placeholder="EUR"
              maxlength="3"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Fee">
            <UInput
              v-model.number="form.fee"
              type="number"
              step="0.01"
              placeholder="-1.00"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Tax">
            <UInput
              v-model.number="form.tax"
              type="number"
              step="0.01"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Description"
            class="col-span-2"
          >
            <UTextarea
              v-model="form.description"
              :rows="2"
              class="w-full"
            />
          </UFormField>
        </div>

        <template v-if="showAssetFields">
          <USeparator label="Asset" />
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Symbol">
              <UInput
                v-model="form.assetSymbol"
                placeholder="LU1681048804"
                class="font-mono w-full"
              />
            </UFormField>
            <UFormField label="Asset Class">
              <USelect
                v-model="form.assetClass"
                :items="assetClassOptions"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Name"
              class="col-span-2"
            >
              <UInput
                v-model="form.assetName"
                placeholder="S&P 500 EUR (Acc)"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Shares">
              <UInput
                v-model.number="form.shares"
                type="number"
                step="any"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Price">
              <UInput
                v-model.number="form.price"
                type="number"
                step="any"
                class="w-full"
              />
            </UFormField>
          </div>
        </template>

        <template v-if="showCounterpartyFields">
          <USeparator label="Counterparty" />
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="IBAN">
              <UInput
                v-model="form.counterpartyIban"
                placeholder="AT83…"
                class="font-mono w-full"
              />
            </UFormField>
            <UFormField label="Name">
              <UInput
                v-model="form.counterpartyName"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Payment Reference"
              class="col-span-2"
            >
              <UInput
                v-model="form.paymentReference"
                class="w-full"
              />
            </UFormField>
          </div>
        </template>

        <template v-if="showCardFields">
          <USeparator label="Card Transaction" />
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Merchant Name">
              <UInput
                v-model="form.merchantName"
                class="w-full"
              />
            </UFormField>
            <UFormField label="MCC Code">
              <UInput
                v-model="form.mccCode"
                maxlength="4"
                class="w-full"
              />
            </UFormField>
          </div>
        </template>

        <template v-if="showFxFields">
          <USeparator label="Foreign Exchange" />
          <div class="grid grid-cols-3 gap-4">
            <UFormField label="Original Amount">
              <UInput
                v-model.number="form.fxOriginalAmount"
                type="number"
                step="any"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Original Currency">
              <UInput
                v-model="form.fxOriginalCurrency"
                maxlength="3"
                placeholder="USD"
                class="w-full"
              />
            </UFormField>
            <UFormField label="FX Rate">
              <UInput
                v-model.number="form.fxRate"
                type="number"
                step="any"
                class="w-full"
              />
            </UFormField>
          </div>
        </template>
      </form>
    </template>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <UButton
          label="Cancel"
          color="neutral"
          variant="outline"
          @click="open = false"
        />
        <UButton
          label="Create Transaction"
          icon="i-lucide-plus"
          :loading="loading"
          @click="handleSubmit"
        />
      </div>
    </template>
  </UModal>
</template>
