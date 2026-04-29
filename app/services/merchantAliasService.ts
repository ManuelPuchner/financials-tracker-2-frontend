import { apiGet, apiPost, apiPut, apiDelete } from '~/services/api'
import type { MerchantAlias, MerchantAliasRequest } from '~/types/transaction'

const BASE = '/merchant-aliases'

export async function fetchMerchantAliases(): Promise<MerchantAlias[]> {
  return apiGet<MerchantAlias[]>(BASE)
}

export async function createMerchantAlias(request: MerchantAliasRequest): Promise<MerchantAlias> {
  return apiPost<MerchantAlias>(BASE, request)
}

export async function updateMerchantAlias(id: number, request: MerchantAliasRequest): Promise<MerchantAlias> {
  return apiPut<MerchantAlias>(`${BASE}/${id}`, request)
}

export async function deleteMerchantAlias(id: number): Promise<void> {
  return apiDelete<void>(`${BASE}/${id}`)
}
