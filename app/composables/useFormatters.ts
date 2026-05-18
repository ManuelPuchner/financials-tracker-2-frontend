export function useFormatters() {
  function formatCurrency(value: number | undefined | null, currency = 'EUR') {
    if (value == null) return '—'
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(value)
  }

  function formatNumber(value: number | undefined | null) {
    if (value == null) return '—'
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4 }).format(value)
  }

  return { formatCurrency, formatNumber }
}
