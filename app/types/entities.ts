export interface EntityStats {
  totalIncome: number
  totalOutgoing: number
  net: number
  transactionCount: number
}

export interface CounterpartyResponse {
  id: number
  iban: string
  name: string | null
  stats: EntityStats
}

export interface MerchantResponse {
  name: string
  stats: EntityStats
}

export type AssetClass = 'FUND' | 'STOCK' | 'DERIVATIVE' | 'CRYPTO'

export interface AssetResponse {
  id: number
  symbol: string
  name: string
  assetClass: AssetClass
  stats: EntityStats
}
