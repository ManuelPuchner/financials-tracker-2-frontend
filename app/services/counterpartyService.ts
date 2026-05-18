import { apiGet } from '~/services/api'
import type { Page, PageParams } from '~/types/api'
import type { CounterpartyResponse } from '~/types/entities'
import type { TransactionResponse } from '~/types/transaction'

const BASE = '/counterparties'

export async function fetchCounterparties(params: PageParams = {}, q?: string, ibanPrefix?: string): Promise<Page<CounterpartyResponse>> {
  return apiGet<Page<CounterpartyResponse>>(BASE, {
    page: params.page,
    size: params.size,
    ...(q ? { q } : {}),
    ...(ibanPrefix ? { ibanPrefix } : {})
  })
}

export async function fetchCounterparty(id: number, accountId?: number): Promise<CounterpartyResponse> {
  return apiGet<CounterpartyResponse>(`${BASE}/${id}`, accountId != null ? { accountId } : undefined)
}

export async function fetchCounterpartyTransactions(
  id: number,
  accountId?: number,
  params: PageParams = {}
): Promise<Page<TransactionResponse>> {
  return apiGet<Page<TransactionResponse>>(`${BASE}/${id}/transactions`, {
    ...(accountId != null ? { accountId } : {}),
    page: params.page,
    size: params.size
  })
}
