import {
  fetchTransactions,
  fetchTransactionsByCategory,
  fetchTransactionsByType,
  fetchTransactionsByDateRange,
  fetchTransactionsByMcc
} from '~/services/transactionService'
import type { PageParams } from '~/types/api'
import type { Category, TransactionResponse, TransactionType } from '~/types/transaction'

export type FilterMode = 'all' | 'category' | 'type' | 'date' | 'mcc'

export interface TransactionFilters {
  mode: FilterMode
  category: Category | undefined
  type: TransactionType | undefined
  from: string
  to: string
  mcc: string | undefined
  page: number
  size: number
  sort: string
}

export function useTransactions() {
  const transactions = ref<TransactionResponse[]>([])
  const totalElements = ref(0)
  const totalPages = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filters = ref<TransactionFilters>({
    mode: 'all',
    category: undefined,
    type: undefined,
    from: '',
    to: '',
    mcc: undefined,
    page: 0,
    size: 50,
    sort: 'date,desc'
  })

  const pageParams = computed<PageParams>(() => ({
    page: filters.value.page,
    size: filters.value.size,
    sort: filters.value.sort
  }))

  async function load() {
    loading.value = true
    error.value = null
    try {
      let result
      const f = filters.value
      if (f.mode === 'category' && f.category) {
        result = await fetchTransactionsByCategory(f.category, pageParams.value)
      } else if (f.mode === 'type' && f.type) {
        result = await fetchTransactionsByType(f.type, pageParams.value)
      } else if (f.mode === 'date' && f.from && f.to) {
        result = await fetchTransactionsByDateRange(f.from, f.to, pageParams.value)
      } else if (f.mode === 'mcc' && f.mcc) {
        result = await fetchTransactionsByMcc(f.mcc, pageParams.value)
      } else {
        result = await fetchTransactions(pageParams.value)
      }
      transactions.value = result.content
      totalElements.value = result.page.totalElements
      totalPages.value = result.page.totalPages
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load transactions'
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    filters.value = {
      mode: 'all',
      category: undefined,
      type: undefined,
      from: '',
      to: '',
      mcc: undefined,
      page: 0,
      size: 50,
      sort: 'date,desc'
    }
  }

  function goToPage(page: number) {
    filters.value.page = page
    load()
  }

  watch(
    () => [
      filters.value.mode,
      filters.value.category,
      filters.value.type,
      filters.value.from,
      filters.value.to,
      filters.value.mcc,
      filters.value.sort,
      filters.value.size
    ],
    () => {
      filters.value.page = 0
      load()
    }
  )

  return {
    transactions,
    totalElements,
    totalPages,
    loading,
    error,
    filters,
    load,
    resetFilters,
    goToPage
  }
}
