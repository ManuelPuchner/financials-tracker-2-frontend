import { apiGet, apiPost, apiPut, apiDelete } from '~/services/api'
import type { TransactionRule, TransactionRuleRequest } from '~/types/transaction'

const BASE = '/transaction-rules'

export async function fetchTransactionRules(): Promise<TransactionRule[]> {
  return apiGet<TransactionRule[]>(BASE)
}

export async function createTransactionRule(request: TransactionRuleRequest): Promise<TransactionRule> {
  return apiPost<TransactionRule>(BASE, request)
}

export async function updateTransactionRule(id: number, request: TransactionRuleRequest): Promise<TransactionRule> {
  return apiPut<TransactionRule>(`${BASE}/${id}`, request)
}

export async function deleteTransactionRule(id: number): Promise<void> {
  await apiDelete<unknown>(`${BASE}/${id}`)
}
