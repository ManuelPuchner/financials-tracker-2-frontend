import { apiGet, apiPut, apiDelete } from '~/services/api'
import type { CounterpartyMerchantMappingResponse } from '~/types/counterpartyMerchantMapping'

const BASE = '/counterparty-merchant-mappings'

export async function fetchAllMappings(): Promise<CounterpartyMerchantMappingResponse[]> {
  return apiGet<CounterpartyMerchantMappingResponse[]>(BASE)
}

export async function fetchMappingByCounterparty(counterpartyId: number): Promise<CounterpartyMerchantMappingResponse | null> {
  try {
    return await apiGet<CounterpartyMerchantMappingResponse>(`${BASE}/by-counterparty/${counterpartyId}`)
  } catch {
    return null
  }
}

export async function upsertMapping(counterpartyId: number, merchantName: string): Promise<CounterpartyMerchantMappingResponse> {
  return apiPut<CounterpartyMerchantMappingResponse>(BASE, { counterpartyId, merchantName })
}

export async function deleteMapping(id: number): Promise<void> {
  return apiDelete<void>(`${BASE}/${id}`)
}
