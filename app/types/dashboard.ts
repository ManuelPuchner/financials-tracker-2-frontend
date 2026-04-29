export interface DashboardOverview {
  cashBalance: number
  currency: string
  totalTransactionCount: number
  totalFeesAndTaxesPaid: number
}

export interface PortfolioPosition {
  symbol: string
  name: string
  totalShares: number
  totalInvested: number
  totalDividendsReceived: number
}

export interface DashboardPortfolio {
  totalInvested: number
  totalDividendsReceived: number
  positions: PortfolioPosition[]
}

export interface TopMerchant {
  merchantName: string
  totalSpent: number
  transactionCount: number
}

export interface DashboardSpending {
  totalCardSpending: number
  totalTransferOutbound: number
  topMerchants: TopMerchant[]
}

export interface DashboardIncome {
  totalIncome: number
  interestPayments: number
  dividends: number
  bonuses: number
  saveback: number
  transferInbound: number
  customerInpayments: number
}

export interface AccountDashboard {
  account: {
    id: number
    name: string
    color: string | null
    icon: string | null
    source: string
    ownAccountIban: string | null
    createdAt: string
    updatedAt: string
  }
  overview: DashboardOverview
  portfolio: DashboardPortfolio
  spending: DashboardSpending
  income: DashboardIncome
}
