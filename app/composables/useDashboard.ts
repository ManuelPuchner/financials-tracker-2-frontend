import {
  fetchIncome,
  fetchOverview,
  fetchPortfolio,
  fetchSpending,
  fetchByAccount,
} from '~/services/dashboardService'

export function useDashboard() {
  const { data: overview, status: overviewStatus } = useAsyncData('dashboard-overview', fetchOverview, { server: false })
  const { data: portfolio, status: portfolioStatus } = useAsyncData('dashboard-portfolio', fetchPortfolio, { server: false })
  const { data: spending, status: spendingStatus } = useAsyncData('dashboard-spending', fetchSpending, { server: false })
  const { data: income, status: incomeStatus } = useAsyncData('dashboard-income', fetchIncome, { server: false })
  const { data: byAccount, status: byAccountStatus } = useAsyncData('dashboard-by-account', fetchByAccount, { server: false })

  const activeTab = ref('all')

  const tabs = computed(() => [
    { label: 'All Accounts', value: 'all' },
    ...(byAccount.value ?? []).map(a => ({ label: a.account.name, value: String(a.account.id) })),
  ])

  const activeEntry = computed(() =>
    activeTab.value === 'all'
      ? null
      : ((byAccount.value ?? []).find(a => String(a.account.id) === activeTab.value) ?? null),
  )

  const activeOverview = computed(() => activeEntry.value?.overview ?? overview.value)
  const activePortfolio = computed(() => activeEntry.value?.portfolio ?? portfolio.value)
  const activeSpending = computed(() => activeEntry.value?.spending ?? spending.value)
  const activeIncome = computed(() => activeEntry.value?.income ?? income.value)

  const overviewLoading = computed(() =>
    activeTab.value === 'all' ? overviewStatus.value === 'pending' : byAccountStatus.value === 'pending',
  )
  const portfolioLoading = computed(() =>
    activeTab.value === 'all' ? portfolioStatus.value === 'pending' : byAccountStatus.value === 'pending',
  )
  const spendingLoading = computed(() =>
    activeTab.value === 'all' ? spendingStatus.value === 'pending' : byAccountStatus.value === 'pending',
  )
  const incomeLoading = computed(() =>
    activeTab.value === 'all' ? incomeStatus.value === 'pending' : byAccountStatus.value === 'pending',
  )

  return {
    activeTab,
    tabs,
    activeOverview,
    activePortfolio,
    activeSpending,
    activeIncome,
    overviewLoading,
    portfolioLoading,
    spendingLoading,
    incomeLoading,
  }
}
