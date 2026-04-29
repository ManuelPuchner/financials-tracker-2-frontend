import { apiGet } from '~/services/api'
import type { AccountDashboard, DashboardIncome, DashboardOverview, DashboardPortfolio, DashboardSpending } from '~/types/dashboard'

const BASE = '/dashboard'

export function fetchOverview(): Promise<DashboardOverview> {
  return apiGet<DashboardOverview>(`${BASE}/overview`)
}

export function fetchPortfolio(): Promise<DashboardPortfolio> {
  return apiGet<DashboardPortfolio>(`${BASE}/portfolio`)
}

export function fetchSpending(): Promise<DashboardSpending> {
  return apiGet<DashboardSpending>(`${BASE}/spending`)
}

export function fetchIncome(): Promise<DashboardIncome> {
  return apiGet<DashboardIncome>(`${BASE}/income`)
}

export function fetchByAccount(): Promise<AccountDashboard[]> {
  return apiGet<AccountDashboard[]>(`${BASE}/by-account`)
}
