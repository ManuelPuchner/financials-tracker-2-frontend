import { apiGet, apiPost, apiPut, apiDelete } from '~/services/api'
import type { SparkasseRule, SparkasseRuleRequest } from '~/types/transaction'

const BASE = '/sparkasse-rules'

export async function fetchSparkasseRules(): Promise<SparkasseRule[]> {
  return apiGet<SparkasseRule[]>(BASE)
}

export async function createSparkasseRule(request: SparkasseRuleRequest): Promise<SparkasseRule> {
  return apiPost<SparkasseRule>(BASE, request)
}

export async function updateSparkasseRule(id: number, request: SparkasseRuleRequest): Promise<SparkasseRule> {
  return apiPut<SparkasseRule>(`${BASE}/${id}`, request)
}

export async function deleteSparkasseRule(id: number): Promise<void> {
  return apiDelete<void>(`${BASE}/${id}`)
}
