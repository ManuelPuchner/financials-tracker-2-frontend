<script setup lang="ts">
import {
  fetchTransactionRules,
  createTransactionRule,
  updateTransactionRule,
  deleteTransactionRule
} from '~/services/transactionRuleService'
import { fetchCategories } from '~/services/categoryService'
import type { TransactionRule, TransactionRuleRequest, UserCategory } from '~/types/transaction'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Transaction Rules — Financials Tracker' })

const toast = useToast()
const rules = ref<TransactionRule[]>([])
const categories = ref<UserCategory[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingRule = ref<TransactionRule | null>(null)
const saving = ref(false)

const targetFieldOptions = [
  { label: 'Partner Name', value: 'PARTNER_NAME' },
  { label: 'Counterparty Name (SEPA)', value: 'COUNTERPARTY_NAME' },
  { label: 'Reference (Verwendungszweck)', value: 'REFERENCE' },
  { label: 'Both', value: 'BOTH' }
]

const form = reactive<TransactionRuleRequest>({
  pattern: '',
  targetField: 'BOTH',
  userCategoryId: 0,
  priority: 100
})

const categoryOptions = computed(() =>
  categories.value.map(c => ({ label: c.name, value: c.id }))
)

async function load() {
  loading.value = true
  try {
    [rules.value, categories.value] = await Promise.all([fetchTransactionRules(), fetchCategories()])
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingRule.value = null
  form.pattern = ''
  form.targetField = 'BOTH'
  form.userCategoryId = categories.value[0]?.id ?? 0
  form.priority = 100
  showModal.value = true
}

function openEdit(rule: TransactionRule) {
  editingRule.value = rule
  form.pattern = rule.pattern
  form.targetField = rule.targetField
  form.userCategoryId = rule.userCategory.id
  form.priority = rule.priority
  showModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editingRule.value) {
      const updated = await updateTransactionRule(editingRule.value.id, { ...form })
      const idx = rules.value.findIndex(r => r.id === updated.id)
      if (idx !== -1) rules.value[idx] = updated
      toast.add({ title: 'Rule updated', color: 'success', icon: 'i-lucide-check' })
    } else {
      const created = await createTransactionRule({ ...form })
      rules.value.push(created)
      rules.value.sort((a, b) => a.priority - b.priority || a.id - b.id)
      toast.add({ title: 'Rule created', color: 'success', icon: 'i-lucide-check' })
    }
    showModal.value = false
  } catch (err) {
    toast.add({ title: err instanceof Error ? err.message : 'Save failed', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    saving.value = false
  }
}

async function handleDelete(rule: TransactionRule) {
  try {
    await deleteTransactionRule(rule.id)
    rules.value = rules.value.filter(r => r.id !== rule.id)
    toast.add({ title: 'Rule deleted', color: 'success', icon: 'i-lucide-check' })
  } catch (err) {
    toast.add({ title: err instanceof Error ? err.message : 'Delete failed', color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

onMounted(load)
</script>

<template>
  <div>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar title="Transaction Rules">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #right>
            <UButton
              label="New Rule"
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
            Rules auto-assign a category to Sparkasse transactions and Trade Republic card payments. Evaluated in priority order (lowest first); first match wins.
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
            v-else-if="rules.length === 0"
            class="text-muted text-sm py-8 text-center"
          >
            No rules yet.
          </div>

          <div
            v-else
            class="flex flex-col gap-2"
          >
            <div
              v-for="rule in rules"
              :key="rule.id"
              class="flex items-center gap-3 px-4 py-3 rounded-lg border border-default bg-background"
            >
              <div class="flex items-center justify-center size-8 rounded font-mono text-xs text-muted border border-default shrink-0">
                {{ rule.priority }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-mono text-sm truncate">
                  {{ rule.pattern }}
                </div>
                <div class="text-xs text-muted mt-0.5 flex items-center gap-2">
                  <span>{{ rule.targetField }}</span>
                  <span>→</span>
                  <div class="flex items-center gap-1">
                    <span
                      v-if="rule.userCategory.color"
                      class="size-2 rounded-full"
                      :style="{ backgroundColor: rule.userCategory.color }"
                    />
                    <span class="font-medium text-default">{{ rule.userCategory.name }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="openEdit(rule)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="handleDelete(rule)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </UDashboardPanel>

    <UModal
      v-model:open="showModal"
      :title="editingRule ? 'Edit Rule' : 'New Transaction Rule'"
    >
      <template #body>
        <div class="flex flex-col gap-4">
          <UFormField
            label="Pattern (regex)"
            required
          >
            <UInput
              v-model="form.pattern"
              placeholder="e.g. (?i)billa"
              class="w-full font-mono"
            />
          </UFormField>
          <UFormField
            label="Match Against"
            required
          >
            <USelectMenu
              v-model="form.targetField"
              :items="targetFieldOptions"
              value-key="value"
              label-key="label"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Category"
            required
          >
            <USelectMenu
              v-model="form.userCategoryId"
              :items="categoryOptions"
              value-key="value"
              label-key="label"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Priority">
            <UInput
              v-model.number="form.priority"
              type="number"
              placeholder="100"
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
            :label="editingRule ? 'Save' : 'Create'"
            :loading="saving"
            :disabled="!form.pattern.trim() || !form.userCategoryId"
            @click="handleSave"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
