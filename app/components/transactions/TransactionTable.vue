<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { TransactionResponse } from '~/types/transaction'

defineProps<{
  transactions: TransactionResponse[]
  loading: boolean
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}>()

const emit = defineEmits<{
  'select': [transaction: TransactionResponse]
  'page-change': [page: number]
}>()

const columns: TableColumn<TransactionResponse>[] = [
  { id: 'date', header: 'Date' },
  { id: 'type', header: 'Type', meta: { class: { th: 'hidden md:table-cell', td: 'hidden md:table-cell' } } },
  { id: 'category', header: 'Category', meta: { class: { th: 'hidden lg:table-cell', td: 'hidden lg:table-cell' } } },
  { id: 'userCategory', header: 'User Category', meta: { class: { th: 'hidden lg:table-cell', td: 'hidden lg:table-cell' } } },
  { id: 'asset', header: 'Asset' },
  { id: 'amount', header: 'Amount' },
  { id: 'fee', header: 'Fee', meta: { class: { th: 'hidden sm:table-cell', td: 'hidden sm:table-cell' } } },
  { id: 'actions', header: '' }
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-AT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="relative overflow-x-auto">
      <UTable
        :data="transactions"
        :columns="columns"
        :loading="loading"
        hover
        class="w-full"
      >
        <template #date-cell="{ row }">
          <span class="text-sm text-muted font-mono whitespace-nowrap">
            {{ formatDate(row.original.date) }}
          </span>
        </template>

        <template #type-cell="{ row }">
          <TransactionsTransactionTypeBadge :type="row.original.type" />
        </template>

        <template #category-cell="{ row }">
          <TransactionsTransactionCategoryBadge :category="row.original.category" />
        </template>

        <template #userCategory-cell="{ row }">
          <div
            v-if="row.original.userCategory"
            class="flex items-center gap-1.5"
          >
            <UIcon
              v-if="row.original.userCategory.icon"

              :name="`i-lucide-${row.original.userCategory.icon}`"
              class="size-4 text-muted"
              :style="{ color: row.original.userCategory.color }"
            />
            <span class="text-sm truncate max-w-28">{{ row.original.userCategory.name }}</span>
          </div>
          <span
            v-else
            class="text-muted text-sm"
          >—</span>
        </template>

        <template #asset-cell="{ row }">
          <div
            v-if="row.original.assetInfo"
            class="flex flex-col"
          >
            <span class="text-sm font-medium truncate max-w-40">
              {{ row.original.assetInfo.name }}
            </span>
            <span class="text-xs text-muted">
              {{ row.original.assetInfo.shares }} shares
            </span>
          </div>
          <div
            v-else-if="row.original.merchantName"
            class="text-sm text-muted truncate max-w-40"
          >
            {{ row.original.merchantName }}
          </div>
          <div
            v-else-if="row.original.counterpartyInfo"
            class="flex flex-col"
          >
            <span class="text-sm truncate max-w-40">
              {{ row.original.counterpartyInfo.name }}
            </span>
            <span class="text-xs text-muted font-mono">
              {{ row.original.counterpartyInfo.iban }}
            </span>
          </div>
          <span
            v-else
            class="text-muted text-sm"
          >—</span>
        </template>

        <template #amount-cell="{ row }">
          <div class="text-right">
            <TransactionsTransactionAmountBadge
              :amount="row.original.amount"
              :currency="row.original.currency"
            />
          </div>
        </template>

        <template #fee-cell="{ row }">
          <div class="text-right">
            <span
              v-if="row.original.fee !== null"
              class="text-sm text-muted font-mono"
            >
              {{ row.original.fee?.toFixed(2) }} {{ row.original.currency }}
            </span>
            <span
              v-else
              class="text-muted text-sm"
            >—</span>
          </div>
        </template>

        <template #actions-cell="{ row }">
          <UButton
            icon="i-lucide-eye"
            color="neutral"
            variant="ghost"
            size="sm"
            @click.stop="emit('select', row.original)"
          />
        </template>
      </UTable>
    </div>

    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between px-1"
    >
      <span class="text-sm text-muted">
        {{ totalElements.toLocaleString() }} transactions
      </span>
      <UPagination
        :page="currentPage + 1"
        :total="totalElements"
        :items-per-page="pageSize"
        :sibling-count="1"
        @update:page="emit('page-change', $event - 1)"
      />
    </div>
    <div
      v-else-if="!loading"
      class="text-sm text-muted px-1"
    >
      {{ totalElements.toLocaleString() }} transaction{{ totalElements !== 1 ? 's' : '' }}
    </div>
  </div>
</template>
