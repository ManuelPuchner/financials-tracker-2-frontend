import { apiGet, apiPost, apiPut, apiDelete } from '~/services/api'
import type { AssetRule, AssetRuleRequest, AssetClass } from '~/types/transaction'

const BASE = '/asset-rules'

export async function fetchAssetRules(assetClass?: AssetClass): Promise<AssetRule[]> {
  const url = assetClass ? `${BASE}?assetClass=${assetClass}` : BASE
  return apiGet<AssetRule[]>(url)
}

export async function createAssetRule(request: AssetRuleRequest): Promise<AssetRule> {
  return apiPost<AssetRule>(BASE, request)
}

export async function updateAssetRule(id: number, request: AssetRuleRequest): Promise<AssetRule> {
  return apiPut<AssetRule>(`${BASE}/${id}`, request)
}

export async function deleteAssetRule(id: number): Promise<void> {
  return apiDelete<void>(`${BASE}/${id}`)
}
