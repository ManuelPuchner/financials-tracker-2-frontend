export type AccountType = 'DEFAULT'

export interface Account {
  id: number
  name: string
  color: string | null
  icon: string | null
  source: TransactionSource
  ownAccountIban: string | null
  createdAt: string
  updatedAt: string
}

export interface AccountPatch {
  name?: string
  color?: string
  icon?: string
}

export interface MerchantAlias {
  id: number
  pattern: string
  canonicalName: string
  createdAt: string
  updatedAt: string
}

export interface MerchantAliasRequest {
  pattern: string
  canonicalName: string
}

export interface TransactionRule {
  id: number
  pattern: string
  targetField: 'PARTNER_NAME' | 'COUNTERPARTY_NAME' | 'REFERENCE' | 'BOTH'
  userCategory: UserCategory
  priority: number
  createdAt: string
  updatedAt: string
}

export interface TransactionRuleRequest {
  pattern: string
  targetField: 'PARTNER_NAME' | 'COUNTERPARTY_NAME' | 'REFERENCE' | 'BOTH'
  userCategoryId: number
  priority?: number
}

export type AssetRuleTargetField = 'SYMBOL' | 'NAME' | 'BOTH'

export interface AssetRule {
  id: number
  pattern: string
  targetField: AssetRuleTargetField
  assetClass: AssetClass
  userCategory: UserCategory
  priority: number
  createdAt: string
  updatedAt: string
}

export interface AssetRuleRequest {
  pattern: string
  targetField: AssetRuleTargetField
  assetClass: AssetClass
  userCategoryId: number
  priority?: number
}

export interface TransactionPatch {
  note?: string | null
  description?: string | null
  merchantName?: string | null
  mccCode?: string | null
  userCategoryId?: number | null
  category?: Category
}

export type TransactionSource = 'TRADE_REPUBLIC' | 'SPARKASSE' | 'BARGELD'

export type Category = 'TRADING' | 'CASH' | 'DELIVERY'

export interface UserCategory {
  id: number
  name: string
  color: string | null
  icon: string | null
}

export interface UserCategoryRequest {
  name: string
  color?: string
  icon?: string
}

export type TransactionType
  = | 'BUY'
    | 'SELL'
    | 'CUSTOMER_INPAYMENT'
    | 'CUSTOMER_INBOUND'
    | 'STOCKPERK'
    | 'INTEREST_PAYMENT'
    | 'DIVIDEND'
    | 'CARD_TRANSACTION'
    | 'CARD_TRANSACTION_INTERNATIONAL'
    | 'MIGRATION'
    | 'TRANSFER_INBOUND'
    | 'TRANSFER_INSTANT_INBOUND'
    | 'TRANSFER_INSTANT_OUTBOUND'
    | 'BENEFITS_SAVEBACK'
    | 'TAX_OPTIMIZATION'
    | 'BONUS'
    | 'EARNINGS'

export type AssetClass = 'FUND' | 'STOCK' | 'DERIVATIVE' | 'CRYPTO'

export interface AssetInfo {
  assetId: number
  symbol: string
  name: string
  assetClass: AssetClass
  shares: number
  price: number
}

export interface FxInfo {
  originalAmount: number
  originalCurrency: string
  fxRate: number
}

export interface CounterpartyInfo {
  counterpartyId: number
  iban: string
  name: string
  paymentReference: string | null
}

export interface TransactionResponse {
  id: number
  transactionId: string
  source: TransactionSource
  datetime: string
  date: string
  accountType: AccountType
  category: Category
  type: TransactionType
  amount: number
  fee: number | null
  tax: number | null
  currency: string
  description: string | null
  note: string | null
  assetInfo: AssetInfo | null
  fxInfo: FxInfo | null
  counterpartyInfo: CounterpartyInfo | null
  merchantName: string | null
  rawMerchantName: string | null
  mccCode: { mcc: string, description: string } | null
  userCategory: UserCategory | null
  account: Account | null
  ownAccountIban: string | null
  ownAccountName: string | null
  sepaMandateId: string | null
  sepaCreditorId: string | null
  paymentMethod: string | null
  receiverReference: string | null
}

export interface TransactionRequest {
  transactionId: string
  accountId?: number
  transactionSource?: TransactionSource
  datetime: string
  date: string
  accountType: AccountType
  category: Category
  type: TransactionType
  amount: number
  currency: string
  fee?: number
  tax?: number
  description?: string
  assetSymbol?: string
  assetName?: string
  assetClass?: AssetClass
  shares?: number
  price?: number
  counterpartyIban?: string
  counterpartyName?: string
  paymentReference?: string
  merchantName?: string
  mccCode?: string
  fxOriginalAmount?: number
  fxOriginalCurrency?: string
  fxRate?: number
}

export interface MccCode {
  mcc: string
  description: string
  userCategory: UserCategory | null
}

export interface CsvImportResult {
  total: number
  imported: number
  skipped: number
}

export const TRANSACTION_TYPES: TransactionType[] = [
  'BUY',
  'SELL',
  'CUSTOMER_INPAYMENT',
  'CUSTOMER_INBOUND',
  'STOCKPERK',
  'INTEREST_PAYMENT',
  'DIVIDEND',
  'CARD_TRANSACTION',
  'CARD_TRANSACTION_INTERNATIONAL',
  'MIGRATION',
  'TRANSFER_INBOUND',
  'TRANSFER_INSTANT_INBOUND',
  'TRANSFER_INSTANT_OUTBOUND',
  'BENEFITS_SAVEBACK',
  'TAX_OPTIMIZATION',
  'BONUS',
  'EARNINGS'
]

export const CATEGORIES: Category[] = ['TRADING', 'CASH', 'DELIVERY']

export const ASSET_CLASSES: AssetClass[] = ['FUND', 'STOCK', 'DERIVATIVE', 'CRYPTO']
