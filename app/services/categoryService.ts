import { apiDelete, apiGet, apiPost, apiPut } from '~/services/api'
import type { UserCategory, UserCategoryRequest, MccCode } from '~/types/transaction'

const BASE = '/categories'

export async function fetchCategories(): Promise<UserCategory[]> {
  return apiGet<UserCategory[]>(BASE)
}

export async function fetchCategoryById(id: number): Promise<UserCategory> {
  return apiGet<UserCategory>(`${BASE}/${id}`)
}

export async function createCategory(request: UserCategoryRequest): Promise<UserCategory> {
  return apiPost<UserCategory>(BASE, request)
}

export async function updateCategory(id: number, request: UserCategoryRequest): Promise<UserCategory> {
  return apiPut<UserCategory>(`${BASE}/${id}`, request)
}

export async function deleteCategory(id: number): Promise<void> {
  return apiDelete<void>(`${BASE}/${id}`)
}

export async function fetchMccCodes(mapped?: boolean): Promise<MccCode[]> {
  const url = mapped === undefined ? '/mcc' : `/mcc?mapped=${mapped}`
  return apiGet<MccCode[]>(url)
}

export async function fetchMccCode(mcc: string): Promise<MccCode> {
  return apiGet<MccCode>(`/mcc/${mcc}`)
}

export async function setMccCategory(mcc: string, categoryId: number | null): Promise<MccCode> {
  return apiPut<MccCode>(`/mcc/${mcc}/category`, { categoryId })
}
