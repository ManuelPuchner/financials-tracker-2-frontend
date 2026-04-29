import { importCsv } from '~/services/transactionService'
import type { CsvImportResult } from '~/types/transaction'

export function useCsvImport() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<CsvImportResult | null>(null)

  async function upload(file: File) {
    loading.value = true
    error.value = null
    result.value = null
    try {
      result.value = await importCsv(file)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Import failed'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    error.value = null
    result.value = null
  }

  return {
    loading,
    error,
    result,
    upload,
    reset
  }
}
