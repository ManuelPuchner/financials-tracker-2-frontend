# Dashboard Endpoints

All endpoints are under `/api/dashboard` and return `200 OK` with no query parameters.

---

## GET /api/dashboard/overview

General account summary. Cash balance is computed as the sum of all inflow transaction amounts minus all outflow amounts minus all fees and taxes.

**Inflows counted:** `CUSTOMER_INPAYMENT`, `CUSTOMER_INBOUND`, `TRANSFER_INBOUND`, `TRANSFER_INSTANT_INBOUND`, `INTEREST_PAYMENT`, `DIVIDEND`, `BONUS`, `BENEFITS_SAVEBACK`, `STOCKPERK`, `EARNINGS`, `TAX_OPTIMIZATION`

**Outflows counted:** `CARD_TRANSACTION`, `CARD_TRANSACTION_INTERNATIONAL`, `TRANSFER_INSTANT_OUTBOUND`, `BUY`

**Response**

```json
{
  "cashBalance": 4250.83,
  "currency": "EUR",
  "totalTransactionCount": 312,
  "totalFeesAndTaxesPaid": 38.50
}
```

| Field | Description |
|---|---|
| `cashBalance` | Net cash balance derived from transaction history |
| `currency` | Always `EUR` (all amounts are stored in EUR) |
| `totalTransactionCount` | Total number of transactions in the database |
| `totalFeesAndTaxesPaid` | Sum of all `fee` and `tax` fields across all transactions |

---

## GET /api/dashboard/portfolio

Portfolio summary based purely on transaction cost basis — does not reflect current market value.

**Response**

```json
{
  "totalInvested": 12500.00,
  "totalDividendsReceived": 320.40,
  "positions": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "totalShares": 5.5,
      "totalInvested": 850.00,
      "totalDividendsReceived": 12.50
    }
  ]
}
```

| Field | Description |
|---|---|
| `totalInvested` | Sum of `totalInvested` across all positions |
| `totalDividendsReceived` | Sum of `totalDividendsReceived` across all positions |
| `positions[].totalShares` | Net shares held (BUY adds, SELL subtracts) |
| `positions[].totalInvested` | Net amount invested (BUY adds, SELL subtracts) |
| `positions[].totalDividendsReceived` | Sum of `DIVIDEND` transaction amounts for the asset |

---

## GET /api/dashboard/spending

Outgoing cash flow broken down by card spending and transfers, plus the top 10 merchants by total amount spent.

**Response**

```json
{
  "totalCardSpending": 2100.75,
  "totalTransferOutbound": 500.00,
  "topMerchants": [
    {
      "merchantName": "REWE",
      "totalSpent": 430.20,
      "transactionCount": 18
    }
  ]
}
```

| Field | Description |
|---|---|
| `totalCardSpending` | Sum of `CARD_TRANSACTION` + `CARD_TRANSACTION_INTERNATIONAL` amounts |
| `totalTransferOutbound` | Sum of `TRANSFER_INSTANT_OUTBOUND` amounts |
| `topMerchants` | Top 10 merchants by total amount spent, descending |

---

## GET /api/dashboard/income

All income broken down by source type.

**Response**

```json
{
  "totalIncome": 6500.00,
  "interestPayments": 120.30,
  "dividends": 320.40,
  "bonuses": 50.00,
  "saveback": 15.20,
  "transferInbound": 5800.00,
  "customerInpayments": 194.10
}
```

| Field | Description |
|---|---|
| `totalIncome` | Sum of all fields below |
| `interestPayments` | `INTEREST_PAYMENT` transactions |
| `dividends` | `DIVIDEND` transactions |
| `bonuses` | `BONUS` transactions |
| `saveback` | `BENEFITS_SAVEBACK` transactions |
| `transferInbound` | `TRANSFER_INBOUND` + `TRANSFER_INSTANT_INBOUND` transactions |
| `customerInpayments` | `CUSTOMER_INPAYMENT` + `CUSTOMER_INBOUND` transactions |
