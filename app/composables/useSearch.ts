import { fetchCounterparties } from '~/services/counterpartyService'
import { fetchMerchants } from '~/services/merchantService'
import { fetchAssets } from '~/services/assetService'

export function useSearch() {
  const searchTerm = ref('')
  const loading = ref(false)

  const groups = ref<any[]>([])

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  async function search(q: string) {
    if (!q || q.length < 2) {
      groups.value = []
      return
    }

    loading.value = true
    try {
      const [merchantsResult, counterpartiesResult, assetsResult] = await Promise.all([
        fetchMerchants({ page: 0, size: 5 }, q),
        fetchCounterparties({ page: 0, size: 5 }, q),
        fetchAssets({ page: 0, size: 5 }, q),
      ])

      const newGroups = []

      if (merchantsResult.content.length > 0) {
        newGroups.push({
          id: 'merchants',
          label: 'Merchants',
          items: merchantsResult.content.map(m => ({
            label: m.name,
            icon: 'i-lucide-store',
            onSelect: () => navigateTo(`/merchants/${encodeURIComponent(m.name)}`),
          })),
        })
      }

      if (counterpartiesResult.content.length > 0) {
        newGroups.push({
          id: 'counterparties',
          label: 'Counterparties',
          items: counterpartiesResult.content.map(c => ({
            label: c.name ?? c.iban,
            suffix: c.name ? c.iban : undefined,
            icon: 'i-lucide-users',
            onSelect: () => navigateTo(`/counterparties/${c.id}`),
          })),
        })
      }

      if (assetsResult.content.length > 0) {
        newGroups.push({
          id: 'assets',
          label: 'Assets',
          items: assetsResult.content.map(a => ({
            label: a.name,
            suffix: a.symbol,
            icon: 'i-lucide-chart-candlestick',
            onSelect: () => navigateTo(`/assets/${a.id}`),
          })),
        })
      }

      groups.value = newGroups
    } finally {
      loading.value = false
    }
  }

  watch(searchTerm, (q) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (!q || q.length < 2) {
      groups.value = []
      return
    }
    debounceTimer = setTimeout(() => search(q), 250)
  })

  return { searchTerm, groups, loading }
}
