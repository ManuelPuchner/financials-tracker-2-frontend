<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

useSeoMeta({ title: 'Import CSV — Financials Tracker' })

const items = [
  { label: 'Trade Republic', slot: 'tr' as const, icon: 'i-lucide-trending-up' },
  { label: 'Sparkasse', slot: 'sparkasse' as const, icon: 'i-lucide-building-2' },
  { label: 'Bulk CSV', slot: 'bulk' as const, icon: 'i-lucide-table-2' }
]
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Import CSV">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div>
        <UTabs
          :items="items"
          class="w-full"
        >
          <template #tr>
            <div class="pt-4">
              <ImportCsvImportPanel />
            </div>
          </template>
          <template #sparkasse>
            <div class="pt-4">
              <ImportSparklasseCsvImportPanel />
            </div>
          </template>
          <template #bulk>
            <div class="pt-4">
              <ImportBulkImportPanel />
            </div>
          </template>
        </UTabs>
      </div>
    </template>
  </UDashboardPanel>
</template>
