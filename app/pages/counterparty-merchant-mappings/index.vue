<script setup lang="ts">
import { fetchAllMappings, deleteMapping } from '~/services/counterpartyMerchantMappingService'
import type { CounterpartyMerchantMappingResponse } from '~/types/counterpartyMerchantMapping'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Counterparty Merchant Mappings — Financials Tracker' })

const toast = useToast()
const mappings = ref<CounterpartyMerchantMappingResponse[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    mappings.value = await fetchAllMappings()
  } finally {
    loading.value = false
  }
}

async function handleDelete(mapping: CounterpartyMerchantMappingResponse) {
  try {
    await deleteMapping(mapping.id)
    mappings.value = mappings.value.filter(m => m.id !== mapping.id)
    toast.add({ title: 'Mapping removed', color: 'success', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Failed to remove mapping', color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

onMounted(load)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Counterparty Merchant Mappings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 max-w-2xl">
        <p class="text-sm text-muted">
          Maps counterparties (SEPA / standing orders) to a canonical merchant name so their transactions
          appear alongside card transactions for the same merchant. Edit mappings from the counterparty
          detail page.
        </p>

        <div
          v-if="loading"
          class="flex justify-center py-12"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="size-6 animate-spin text-muted"
          />
        </div>

        <div
          v-else-if="mappings.length === 0"
          class="text-muted text-sm py-8 text-center"
        >
          No mappings yet. Open a counterparty's detail page to add one.
        </div>

        <div
          v-else
          class="flex flex-col gap-2"
        >
          <div
            v-for="m in mappings"
            :key="m.id"
            class="flex items-center gap-3 px-4 py-3 rounded-lg border border-default bg-background"
          >
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">
                {{ m.counterpartyName ?? m.counterpartyIban }}
              </div>
              <div class="font-mono text-xs text-muted mt-0.5">
                {{ m.counterpartyIban }}
              </div>
              <div class="text-sm text-muted mt-1">
                → <span class="font-medium text-default">{{ m.merchantName }}</span>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <UButton
                label="Open"
                icon="i-lucide-arrow-right"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="navigateTo(`/counterparties/${m.counterpartyId}`)"
              />
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                @click="handleDelete(m)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
