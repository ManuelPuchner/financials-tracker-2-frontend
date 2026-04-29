import { apiGet, apiPatch, apiPost, apiPostMultipart, apiDelete } from '~/services/api'
import type { Page, PageParams } from '~/types/api'
import type { Category, CsvImportResult, MccCode, TransactionPatch, TransactionRequest, TransactionResponse, TransactionType } from '~/types/transaction'

const BASE = '/transactions'

function pageParamsToRecord(params: PageParams): Record<string, string | number | undefined> {
  return {
    page: params.page,
    size: params.size,
    sort: params.sort
  }
}

export async function fetchTransactions(params: PageParams = {}): Promise<Page<TransactionResponse>> {
  return apiGet<Page<TransactionResponse>>(BASE, pageParamsToRecord(params))
}

export async function fetchTransactionById(transactionId: string): Promise<TransactionResponse> {
  return apiGet<TransactionResponse>(`${BASE}/${transactionId}`)
}

export async function fetchTransactionsByCategory(
  category: Category,
  params: PageParams = {}
): Promise<Page<TransactionResponse>> {
  return apiGet<Page<TransactionResponse>>(
    `${BASE}/by-category/${category}`,
    pageParamsToRecord(params)
  )
}

export async function fetchTransactionsByType(
  type: TransactionType,
  params: PageParams = {}
): Promise<Page<TransactionResponse>> {
  return apiGet<Page<TransactionResponse>>(
    `${BASE}/by-type/${type}`,
    pageParamsToRecord(params)
  )
}

export async function fetchTransactionsByDateRange(
  from: string,
  to: string,
  params: PageParams = {}
): Promise<Page<TransactionResponse>> {
  return apiGet<Page<TransactionResponse>>(`${BASE}/by-date`, {
    from,
    to,
    ...pageParamsToRecord(params)
  })
}

export async function createTransaction(request: TransactionRequest): Promise<TransactionResponse> {
  return apiPost<TransactionResponse>(BASE, request)
}

export async function fetchMccCodes(): Promise<MccCode[]> {
  return apiGet<MccCode[]>('/mcc')
}

export async function fetchTransactionsByMcc(
  mcc: string,
  params: PageParams = {}
): Promise<Page<TransactionResponse>> {
  return apiGet<Page<TransactionResponse>>(
    `${BASE}/by-mcc/${mcc}`,
    pageParamsToRecord(params)
  )
}

export async function importCsv(file: File): Promise<CsvImportResult> {
  const formData = new FormData()
  formData.append('file', file)
  return apiPostMultipart<CsvImportResult>(`${BASE}/import/csv`, formData)
}

export async function importSparkasseJson(file: File): Promise<CsvImportResult> {
  const formData = new FormData()
  formData.append('file', file)
  return apiPostMultipart<CsvImportResult>(`${BASE}/import/sparkasse-json`, formData)
}

export async function fetchTransactionsByMerchant(
  q: string,
  params: PageParams = {}
): Promise<Page<TransactionResponse>> {
  return apiGet<Page<TransactionResponse>>(`${BASE}/by-merchant`, {
    q,
    ...pageParamsToRecord(params)
  })
}

export async function patchTransaction(
  transactionId: string,
  patch: TransactionPatch
): Promise<TransactionResponse> {
  return apiPatch<TransactionResponse>(`${BASE}/${transactionId}`, patch)
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  return apiDelete<void>(`${BASE}/${transactionId}`)
}
