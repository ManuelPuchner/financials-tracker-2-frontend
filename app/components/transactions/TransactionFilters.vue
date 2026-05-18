<script setup lang="ts">
import type { TransactionFilters, FilterMode } from '~/composables/useTransactions'
import { fetchMccCodes } from '~/services/transactionService'
import { CATEGORIES, TRANSACTION_TYPES } from '~/types/transaction'

const props = defineProps<{
  modelValue: TransactionFilters
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TransactionFilters]
  'reset': []
}>()

const filters = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const modeOptions = [
  { label: 'All', value: 'all' },
  { label: 'By Category', value: 'category' },
  { label: 'By Type', value: 'type' },
  { label: 'By Date Range', value: 'date' },
  { label: 'By MCC Code', value: 'mcc' }
]

const categoryOptions = CATEGORIES.map(c => ({ label: c, value: c }))
const typeOptions = TRANSACTION_TYPES.map(t => ({ label: t.replace(/_/g, ' '), value: t }))

const sortOptions = [
  { label: 'Date (newest first)', value: 'date,desc' },
  { label: 'Date (oldest first)', value: 'date,asc' },
  { label: 'Amount (highest first)', value: 'amount,desc' },
  { label: 'Amount (lowest first)', value: 'amount,asc' }
]

const mccOptions = ref<{ label: string, value: string }[]>([])
const mccLoading = ref(false)

async function loadMccCodes() {
  if (mccOptions.value.length > 0) return
  mccLoading.value = true
  try {
    const codes = await fetchMccCodes()
    mccOptions.value = codes.map(c => ({
      label: `${c.description} (${c.mcc})`,
      value: c.mcc
    }))
  } finally {
    mccLoading.value = false
  }
}

function setMode(mode: FilterMode) {
  filters.value = { ...filters.value, mode }
  if (mode === 'mcc') loadMccCodes()
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg border border-default">
    <div class="flex flex-wrap gap-3 items-end">
      <div class="flex flex-col gap-1 min-w-40">
        <label class="text-xs font-medium text-muted">Filter mode</label>
        <USelect
          :model-value="filters.mode"
          :items="modeOptions"
          value-key="value"
          label-key="label"
          @update:model-value="setMode($event as FilterMode)"
        />
      </div>

      <div
        v-if="filters.mode === 'category'"
        class="flex flex-col gap-1 min-w-40"
      >
        <label class="text-xs font-medium text-muted">Category</label>
        <USelect
          v-model="filters.category"
          :items="categoryOptions"
          value-key="value"
          label-key="label"
          placeholder="Pick category"
        />
      </div>

      <div
        v-if="filters.mode === 'type'"
        class="flex flex-col gap-1 min-w-56"
      >
        <label class="text-xs font-medium text-muted">Type</label>
        <USelect
          v-model="filters.type"
          :items="typeOptions"
          value-key="value"
          label-key="label"
          placeholder="Pick type"
        />
      </div>

      <div
        v-if="filters.mode === 'mcc'"
        class="flex flex-col gap-1 min-w-72"
      >
        <label class="text-xs font-medium text-muted">MCC Code</label>
        <USelect
          v-model="filters.mcc"
          :items="mccOptions"
          value-key="value"
          label-key="label"
          :loading="mccLoading"
          placeholder="Pick MCC code"
          searchable
        />
      </div>

      <template v-if="filters.mode === 'date'">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-muted">From</label>
          <UInput
            v-model="filters.from"
            type="date"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-muted">To</label>
          <UInput
            v-model="filters.to"
            type="date"
          />
        </div>
      </template>

      <div class="flex flex-col gap-1 min-w-48">
        <label class="text-xs font-medium text-muted">Sort</label>
        <USelect
          v-model="filters.sort"
          :items="sortOptions"
          value-key="value"
          label-key="label"
        />
      </div>

      <UButton
        label="Reset"
        icon="i-lucide-x"
        color="neutral"
        variant="outline"
        @click="emit('reset')"
      />
    </div>
  </div>
</template>
