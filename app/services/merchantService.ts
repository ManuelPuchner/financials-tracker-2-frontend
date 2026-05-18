import { apiGet } from '~/services/api'
import type { Page, PageParams } from '~/types/api'
import type { MerchantResponse } from '~/types/entities'
import type { TransactionResponse } from '~/types/transaction'

const BASE = '/merchants'

export async function fetchMerchants(params: PageParams = {}, q?: string): Promise<Page<MerchantResponse>> {
  return apiGet<Page<MerchantResponse>>(BASE, { page: params.page, size: params.size, ...(q ? { q } : {}) })
}

export async function fetchMerchant(name: string, accountId?: number): Promise<MerchantResponse> {
  return apiGet<MerchantResponse>(`${BASE}/${encodeURIComponent(name)}`, accountId != null ? { accountId } : undefined)
}

export async function fetchMerchantTransactions(
  name: string,
  accountId?: number,
  params: PageParams = {}
): Promise<Page<TransactionResponse>> {
  return apiGet<Page<TransactionResponse>>(`${BASE}/${encodeURIComponent(name)}/transactions`, {
    ...(accountId != null ? { accountId } : {}),
    page: params.page,
    size: params.size
  })
}
