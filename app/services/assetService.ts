import { apiGet } from '~/services/api'
import type { Page, PageParams } from '~/types/api'
import type { AssetResponse } from '~/types/entities'
import type { TransactionResponse } from '~/types/transaction'

const BASE = '/assets'

export async function fetchAssets(params: PageParams = {}, q?: string): Promise<Page<AssetResponse>> {
  return apiGet<Page<AssetResponse>>(BASE, { page: params.page, size: params.size, ...(q ? { q } : {}) })
}

export async function fetchAsset(id: number, accountId?: number): Promise<AssetResponse> {
  return apiGet<AssetResponse>(`${BASE}/${id}`, accountId != null ? { accountId } : undefined)
}

export async function fetchAssetTransactions(
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
