<script setup lang="ts">
import {
  fetchMerchantAliases,
  createMerchantAlias,
  updateMerchantAlias,
  deleteMerchantAlias
} from '~/services/merchantAliasService'
import type { MerchantAlias, MerchantAliasRequest } from '~/types/transaction'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Merchant Aliases — Financials Tracker' })

const toast = useToast()
const aliases = ref<MerchantAlias[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingAlias = ref<MerchantAlias | null>(null)
const saving = ref(false)

const form = reactive<MerchantAliasRequest>({
  pattern: '',
  canonicalName: ''
})

async function load() {
  loading.value = true
  try {
    aliases.value = await fetchMerchantAliases()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingAlias.value = null
  form.pattern = ''
  form.canonicalName = ''
  showModal.value = true
}

function openEdit(alias: MerchantAlias) {
  editingAlias.value = alias
  form.pattern = alias.pattern
  form.canonicalName = alias.canonicalName
  showModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editingAlias.value) {
      const updated = await updateMerchantAlias(editingAlias.value.id, { ...form })
      const idx = aliases.value.findIndex(a => a.id === updated.id)
      if (idx !== -1) aliases.value[idx] = updated
      toast.add({ title: 'Alias updated', color: 'success', icon: 'i-lucide-check' })
    } else {
      const created = await createMerchantAlias({ ...form })
      aliases.value.push(created)
      toast.add({ title: 'Alias created', color: 'success', icon: 'i-lucide-check' })
    }
    showModal.value = false
  } catch (err) {
    toast.add({ title: err instanceof Error ? err.message : 'Save failed', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    saving.value = false
  }
}

async function handleDelete(alias: MerchantAlias) {
  try {
    await deleteMerchantAlias(alias.id)
    aliases.value = aliases.value.filter(a => a.id !== alias.id)
    toast.add({ title: 'Alias deleted', color: 'success', icon: 'i-lucide-check' })
  } catch (err) {
    toast.add({ title: err instanceof Error ? err.message : 'Delete failed', color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

onMounted(load)
</script>

<template>
  <div class="contents">
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar title="Merchant Aliases">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #right>
            <UButton
              label="New Alias"
              icon="i-lucide-plus"
              size="sm"
              @click="openCreate"
            />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <div class="flex flex-col gap-4 max-w-2xl">
          <p class="text-sm text-muted">
            Aliases rewrite raw merchant names to a canonical form at import time and retroactively.
            Use Java regex patterns — e.g. <code class="font-mono">(?i)^mcdonalds</code>.
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
            v-else-if="aliases.length === 0"
            class="text-muted text-sm py-8 text-center"
          >
            No merchant aliases yet.
          </div>

          <div
            v-else
            class="flex flex-col gap-2"
          >
            <div
              v-for="alias in aliases"
              :key="alias.id"
              class="flex items-center gap-3 px-4 py-3 rounded-lg border border-default bg-background"
            >
              <div class="flex-1 min-w-0">
                <div class="font-mono text-sm truncate">
                  {{ alias.pattern }}
                </div>
                <div class="text-sm text-muted mt-0.5">
                  → <span class="font-medium text-default">{{ alias.canonicalName }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="openEdit(alias)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="handleDelete(alias)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </UDashboardPanel>

    <UModal
      v-model:open="showModal"
      :title="editingAlias ? 'Edit Alias' : 'New Merchant Alias'"
    >
      <template #body>
        <div class="flex flex-col gap-4">
          <UFormField
            label="Pattern (regex)"
            required
          >
            <UInput
              v-model="form.pattern"
              placeholder="e.g. (?i)^mcdonalds"
              class="w-full font-mono"
            />
          </UFormField>
          <UFormField
            label="Canonical Name"
            required
          >
            <UInput
              v-model="form.canonicalName"
              placeholder="e.g. McDonald's"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="outline"
            @click="showModal = false"
          />
          <UButton
            :label="editingAlias ? 'Save' : 'Create'"
            :loading="saving"
            :disabled="!form.pattern.trim() || !form.canonicalName.trim()"
            @click="handleSave"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
