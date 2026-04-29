import { apiGet, apiPatch } from '~/services/api'
import type { Account, AccountPatch } from '~/types/transaction'

const BASE = '/accounts'

export async function fetchAccounts(): Promise<Account[]> {
  return apiGet<Account[]>(BASE)
}

export async function fetchAccount(id: number): Promise<Account> {
  return apiGet<Account>(`${BASE}/${id}`)
}

export async function updateAccount(id: number, patch: AccountPatch): Promise<Account> {
  return apiPatch<Account>(`${BASE}/${id}`, patch)
}
