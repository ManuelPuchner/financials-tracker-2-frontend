<script setup lang="ts">
import type { TransactionType } from '~/types/transaction'

const props = defineProps<{
  type: TransactionType
}>()

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const COLOR_MAP: Record<TransactionType, BadgeColor> = {
  BUY: 'error',
  SELL: 'success',
  CUSTOMER_INPAYMENT: 'info',
  CUSTOMER_INBOUND: 'info',
  STOCKPERK: 'warning',
  INTEREST_PAYMENT: 'success',
  DIVIDEND: 'success',
  CARD_TRANSACTION: 'neutral',
  CARD_TRANSACTION_INTERNATIONAL: 'neutral',
  MIGRATION: 'secondary',
  TRANSFER_INBOUND: 'info',
  TRANSFER_INSTANT_INBOUND: 'info',
  TRANSFER_INSTANT_OUTBOUND: 'warning',
  BENEFITS_SAVEBACK: 'success',
  TAX_OPTIMIZATION: 'neutral',
  BONUS: 'success',
  EARNINGS: 'success'
}

const LABEL_MAP: Record<TransactionType, string> = {
  BUY: 'Buy',
  SELL: 'Sell',
  CUSTOMER_INPAYMENT: 'In-Payment',
  CUSTOMER_INBOUND: 'Inbound',
  STOCKPERK: 'Stock Perk',
  INTEREST_PAYMENT: 'Interest',
  DIVIDEND: 'Dividend',
  CARD_TRANSACTION: 'Card',
  CARD_TRANSACTION_INTERNATIONAL: 'Card (Intl)',
  MIGRATION: 'Migration',
  TRANSFER_INBOUND: 'Transfer In',
  TRANSFER_INSTANT_INBOUND: 'Instant In',
  TRANSFER_INSTANT_OUTBOUND: 'Instant Out',
  BENEFITS_SAVEBACK: 'Saveback',
  TAX_OPTIMIZATION: 'Tax Opt.',
  BONUS: 'Bonus',
  EARNINGS: 'Earnings'
}

const color = computed(() => COLOR_MAP[props.type] ?? 'neutral')
const label = computed(() => LABEL_MAP[props.type] ?? props.type)
</script>

<template>
  <UBadge
    :color="color"
    :label="label"
    variant="subtle"
    size="sm"
  />
</template>
