<script setup lang="ts">
import { fetchAccounts, updateAccount } from '~/services/accountService'
import type { Account, AccountPatch } from '~/types/transaction'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Accounts — Financials Tracker' })

const toast = useToast()
const accounts = ref<Account[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingAccount = ref<Account | null>(null)
const saving = ref(false)

const form = reactive<AccountPatch>({
  name: '',
  color: '',
  icon: ''
})

async function load() {
  loading.value = true
  try {
    accounts.value = await fetchAccounts()
  } finally {
    loading.value = false
  }
}

function openEdit(account: Account) {
  editingAccount.value = account
  form.name = account.name
  form.color = account.color ?? ''
  form.icon = account.icon ?? ''
  showModal.value = true
}

async function handleSave() {
  if (!editingAccount.value) return
  saving.value = true
  try {
    const patch: AccountPatch = {
      name: form.name || undefined,
      color: form.color ?? undefined,
      icon: form.icon ?? undefined
    }
    const updated = await updateAccount(editingAccount.value.id, patch)
    const idx = accounts.value.findIndex(a => a.id === updated.id)
    if (idx !== -1) accounts.value[idx] = updated
    showModal.value = false
    toast.add({ title: 'Account updated', color: 'success', icon: 'i-lucide-check' })
  } catch (err) {
    toast.add({ title: err instanceof Error ? err.message : 'Save failed', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Accounts">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 max-w-2xl">
        <div
          v-if="loading"
          class="flex justify-center py-12"
        >
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
        </div>

        <div
          v-else-if="accounts.length === 0"
          class="text-muted text-sm py-8 text-center"
        >
          No accounts found. Accounts are created automatically on import.
        </div>

        <div
          v-else
          class="flex flex-col gap-2"
        >
          <div
            v-for="account in accounts"
            :key="account.id"
            class="flex items-center gap-3 px-4 py-3 rounded-lg border border-default bg-background"
          >
            <span
              class="size-4 rounded-full shrink-0"
              :style="{ backgroundColor: account.color ?? '#888' }"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{{ account.name }}</div>
              <div class="text-xs text-muted flex items-center gap-2">
                <span>{{ account.source }}</span>
                <span v-if="account.ownAccountIban" class="font-mono">{{ account.ownAccountIban }}</span>
              </div>
            </div>
            <UBadge
              :label="account.source"
              color="neutral"
              variant="subtle"
              size="xs"
            />
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="openEdit(account)"
            />
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="showModal"
    title="Edit Account"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Name" required>
          <UInput
            v-model="form.name"
            placeholder="e.g. Hauptkonto"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Color">
          <div class="flex items-center gap-2">
            <input
              v-model="form.color"
              type="color"
              class="size-9 rounded cursor-pointer border border-default"
            />
            <UInput
              v-model="form.color"
              placeholder="#3b82f6"
              class="flex-1 font-mono"
            />
          </div>
        </UFormField>
        <UFormField label="Icon">
          <UInput
            v-model="form.icon"
            placeholder="e.g. bank"
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
          label="Save"
          :loading="saving"
          :disabled="!form.name?.trim()"
          @click="handleSave"
        />
      </div>
    </template>
  </UModal>
</template>
