import { createTransaction } from '~/services/transactionService'
import type { TransactionRequest, TransactionResponse } from '~/types/transaction'

export function useCreateTransaction() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function submit(request: TransactionRequest): Promise<TransactionResponse | null> {
    loading.value = true
    error.value = null
    try {
      return await createTransaction(request)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create transaction'
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, submit }
}
