export interface CounterpartyMerchantMappingResponse {
  id: number
  counterpartyId: number
  counterpartyIban: string
  counterpartyName: string | null
  merchantName: string
  createdAt: string
  updatedAt: string
}
