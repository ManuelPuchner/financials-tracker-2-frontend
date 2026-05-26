<script setup lang="ts">
import { fetchMccCodes, setMccCategory, fetchCategories } from '~/services/categoryService'
import type { MccCode, UserCategory } from '~/types/transaction'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'MCC Mappings — Financials Tracker' })

const toast = useToast()
const mccCodes = ref<MccCode[]>([])
const categories = ref<UserCategory[]>([])
const loading = ref(false)
const saving = ref<string | null>(null)
const filterMapped = ref<boolean | undefined>(undefined)
const search = ref('')

const filterOptions = [
  { label: 'All codes', value: undefined },
  { label: 'Mapped only', value: true },
  { label: 'Unmapped only', value: false }
]

const categoryOptions = computed(() => [
  { label: '— None —', value: null },
  ...categories.value.map(c => ({ label: c.name, value: c.id }))
])

const filteredCodes = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return mccCodes.value
  return mccCodes.value.filter(
    m => m.mcc.includes(q) || m.description.toLowerCase().includes(q)
  )
})

async function load() {
  loading.value = true
  try {
    [mccCodes.value, categories.value] = await Promise.all([
      fetchMccCodes(filterMapped.value),
      fetchCategories()
    ])
  } finally {
    loading.value = false
  }
}

watch(filterMapped, load)

async function handleCategoryChange(mcc: MccCode, categoryId: number | null) {
  saving.value = mcc.mcc
  try {
    const updated = await setMccCategory(mcc.mcc, categoryId)
    const idx = mccCodes.value.findIndex(m => m.mcc === updated.mcc)
    if (idx !== -1) mccCodes.value[idx] = updated
    toast.add({ title: `MCC ${mcc.mcc} updated`, color: 'success', icon: 'i-lucide-check' })
  } catch (err) {
    toast.add({ title: err instanceof Error ? err.message : 'Update failed', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    saving.value = null
  }
}

onMounted(load)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="MCC Mappings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 max-w-3xl">
        <p class="text-sm text-muted">
          Map MCC (Merchant Category Codes) to categories. Matched automatically at import time for card transactions with no rule override.
        </p>

        <div class="flex items-center gap-3">
          <UInput
            v-model="search"
            placeholder="Search code or description…"
            icon="i-lucide-search"
            class="flex-1"
          />
          <USelectMenu
            v-model="filterMapped"
            :items="filterOptions"
            value-key="value"
            label-key="label"
            class="w-44"
          />
        </div>

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
          v-else-if="filteredCodes.length === 0"
          class="text-muted text-sm py-8 text-center"
        >
          No MCC codes found.
        </div>

        <div
          v-else
          class="flex flex-col gap-2"
        >
          <div
            v-for="mcc in filteredCodes"
            :key="mcc.mcc"
            class="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg border border-default bg-background"
          >
            <div class="flex items-center justify-center size-12 rounded font-mono text-xs text-muted border border-default shrink-0">
              {{ mcc.mcc }}
            </div>
            <div class="flex-1 min-w-30">
              <div class="text-sm truncate">
                {{ mcc.description }}
              </div>
              <div
                v-if="mcc.userCategory"
                class="flex items-center gap-1 mt-0.5"
              >
                <span
                  v-if="mcc.userCategory.color"
                  class="size-2 rounded-full shrink-0"
                  :style="{ backgroundColor: mcc.userCategory.color }"
                />
                <span class="text-xs text-muted">{{ mcc.userCategory.name }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <UIcon
                v-if="saving === mcc.mcc"
                name="i-lucide-loader-circle"
                class="size-4 animate-spin text-muted shrink-0"
              />
              <USelectMenu
                :model-value="mcc.userCategory?.id ?? null"
                :items="categoryOptions"
                value-key="value"
                label-key="label"
                class="w-full sm:w-44"
                :disabled="saving === mcc.mcc"
                @update:model-value="(val: number | null) => handleCategoryChange(mcc, val)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
