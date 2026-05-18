<script setup lang="ts">
import { fetchMerchants } from '~/services/merchantService'
import { fetchCounterparties } from '~/services/counterpartyService'
import { fetchCategories } from '~/services/categoryService'
import { fetchAccounts } from '~/services/accountService'
import { createTransaction, patchTransaction } from '~/services/transactionService'
import type { Account, UserCategory, TransactionRequest } from '~/types/transaction'
import type { MerchantResponse, CounterpartyResponse } from '~/types/entities'

const toast = useToast()

// Mode
type Mode = 'merchant' | 'counterparty'
const mode = ref<Mode>('merchant')

// Merchant / counterparty search
const searchTerm = ref('')
const searchLoading = ref(false)
const merchantResults = ref<MerchantResponse[]>([])
const counterpartyResults = ref<CounterpartyResponse[]>([])
const selectedItem = ref<{ label: string, value: string, iban?: string, name?: string } | null>(null)

const searchItems = computed(() => {
  if (mode.value === 'merchant') {
    return merchantResults.value.map(m => ({ label: m.name, value: m.name }))
  }
  return counterpartyResults.value.map(c => ({
    label: c.name ? `${c.name} — ${c.iban}` : c.iban,
    value: String(c.id),
    iban: c.iban,
    name: c.name ?? c.iban,
  }))
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchTerm, (val) => {
  clearTimeout(searchTimeout)
  if (!val.trim()) { merchantResults.value = []; counterpartyResults.value = []; return }
  searchTimeout = setTimeout(() => doSearch(val.trim()), 250)
})
watch(mode, () => {
  searchTerm.value = ''; selectedItem.value = null
  merchantResults.value = []; counterpartyResults.value = []
})

async function doSearch(q: string) {
  searchLoading.value = true
  try {
    if (mode.value === 'merchant') {
      merchantResults.value = (await fetchMerchants({ size: 20 }, q)).content
    } else {
      counterpartyResults.value = (await fetchCounterparties({ size: 20 }, q)).content
    }
  } finally { searchLoading.value = false }
}

const showNewModal = ref(false)
const newName = ref('')
const newIban = ref('')

function openNewModal() { newName.value = searchTerm.value; newIban.value = ''; showNewModal.value = true }
function confirmNew() {
  if (!newName.value.trim()) return
  if (mode.value === 'merchant') {
    selectedItem.value = { label: newName.value.trim(), value: newName.value.trim() }
  } else {
    const iban = newIban.value.trim()
    selectedItem.value = {
      label: iban ? `${newName.value.trim()} — ${iban}` : newName.value.trim(),
      value: '__new__', iban, name: newName.value.trim(),
    }
  }
  searchTerm.value = selectedItem.value!.label
  showNewModal.value = false
}

// Accounts
const accounts = ref<Account[]>([])
type AccountOption = { label: string, value: number }
const selectedAccount = ref<AccountOption | null>(null)
const accountOptions = computed<AccountOption[]>(() =>
  accounts.value.map(a => ({ label: a.name, value: a.id }))
)
const resolvedAccountId = computed(() =>
  selectedAccount.value != null
    ? (typeof selectedAccount.value === 'object' ? selectedAccount.value.value : selectedAccount.value as number)
    : undefined
)

// User categories
const userCategories = ref<UserCategory[]>([])
const selectedCategoryId = ref<number | undefined>(undefined)
const categoryOptions = computed(() =>
  userCategories.value.map(c => ({ label: c.name, value: c.id, icon: c.icon ? `i-lucide-${c.icon}` : undefined }))
)
onMounted(async () => {
  [accounts.value, userCategories.value] = await Promise.all([fetchAccounts(), fetchCategories()])
  selectedAccount.value = accountOptions.value[0] ?? null
})

// Editable rows
interface EditableRow {
  id: number
  date: string
  amount: number | undefined
  direction: 'outgoing' | 'incoming'
  note: string
}

let nextId = 1
const today = new Date().toISOString().slice(0, 10)
const rows = ref<EditableRow[]>([])

function addRow() {
  rows.value.push({ id: nextId++, date: today, amount: undefined, direction: 'outgoing', note: '' })
}

function removeRow(id: number) {
  rows.value = rows.value.filter(r => r.id !== id)
}

const validRows = computed(() =>
  rows.value.filter(r => r.date && r.amount !== undefined && r.amount !== null && !isNaN(r.amount as number))
)

// CSV upload to populate table
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const parseError = ref<string | null>(null)

function onDragOver(e: DragEvent) { e.preventDefault(); dragOver.value = true }
function onDragLeave() { dragOver.value = false }
function onDrop(e: DragEvent) {
  e.preventDefault(); dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) readFile(file)
}
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) readFile(file)
}

function readFile(file: File) {
  parseError.value = null
  const reader = new FileReader()
  reader.onload = (e) => parseCsvIntoRows(e.target?.result as string)
  reader.readAsText(file)
  if (fileInput.value) fileInput.value.value = ''
}

function parseCsvIntoRows(text: string) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) { parseError.value = 'CSV must have a header row and at least one data row.'; return }
  const sep = lines[0].includes(';') ? ';' : ','
  const added: EditableRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(sep).map(c => c.trim().replace(/^"|"$/g, ''))
    const [dateRaw = '', amountRaw = '', noteRaw = ''] = cols
    const rawAmount = parseFloat(amountRaw.replace(',', '.'))
    if (!dateRaw || isNaN(rawAmount)) continue
    added.push({
      id: nextId++,
      date: dateRaw,
      amount: Math.abs(rawAmount),
      direction: rawAmount >= 0 ? 'incoming' : 'outgoing',
      note: noteRaw,
    })
  }
  if (added.length === 0) { parseError.value = 'No valid rows found in the CSV.'; return }
  rows.value.push(...added)
  toast.add({ title: `${added.length} rows added from CSV`, color: 'success', icon: 'i-lucide-check' })
}

// Submit
const submitting = ref(false)
const progress = ref(0)
const importResult = ref<{ imported: number, failed: number } | null>(null)

async function handleImport() {
  if (!selectedItem.value) {
    toast.add({ title: 'Please select a merchant or counterparty', color: 'error', icon: 'i-lucide-alert-circle' }); return
  }
  if (validRows.value.length === 0) {
    toast.add({ title: 'No valid rows to import', color: 'error', icon: 'i-lucide-alert-circle' }); return
  }
  submitting.value = true; progress.value = 0
  let imported = 0; let failed = 0

  for (const row of validRows.value) {
    try {
      const signedAmount = row.direction === 'outgoing' ? -Math.abs(row.amount!) : Math.abs(row.amount!)
      const request: TransactionRequest = {
        transactionId: crypto.randomUUID(),
        accountId: resolvedAccountId.value,
        datetime: `${row.date}T12:00:00Z`,
        date: row.date,
        accountType: 'DEFAULT',
        category: 'CASH',
        type: mode.value === 'merchant' ? 'CARD_TRANSACTION' : 'CUSTOMER_INPAYMENT',
        amount: signedAmount,
        currency: 'EUR',
        description: row.note || undefined,
        ...(mode.value === 'merchant'
          ? { merchantName: selectedItem.value!.label }
          : { counterpartyName: selectedItem.value!.name ?? selectedItem.value!.label, counterpartyIban: selectedItem.value!.iban || undefined }
        ),
      }
      const tx = await createTransaction(request)
      if (selectedCategoryId.value) {
        await patchTransaction(tx.transactionId, { userCategoryId: selectedCategoryId.value })
      }
      imported++
    } catch { failed++ }
    progress.value = Math.round(((imported + failed) / validRows.value.length) * 100)
  }

  submitting.value = false
  importResult.value = { imported, failed }
}

function resetAll() {
  rows.value = []; importResult.value = null; progress.value = 0; parseError.value = null
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Context banner -->
    <UAlert
      title="Bargeld Bulk Import"
      description="Import multiple cash transactions at once for a specific merchant or counterparty. All transactions are created as CASH category."
      icon="i-lucide-banknote"
      color="info"
      variant="subtle"
    />

    <!-- Source selection -->
    <UCard>
      <div class="flex flex-col gap-4">
        <p class="text-xs font-semibold text-muted uppercase tracking-wide">Source</p>

        <div class="flex rounded-lg border border-default overflow-hidden">
          <button
            class="flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
            :class="mode === 'merchant' ? 'bg-primary text-white' : 'text-muted hover:bg-elevated'"
            @click="mode = 'merchant'"
          >
            <UIcon name="i-lucide-store" class="size-4" />
            Merchant
          </button>
          <div class="w-px bg-default" />
          <button
            class="flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
            :class="mode === 'counterparty' ? 'bg-primary text-white' : 'text-muted hover:bg-elevated'"
            @click="mode = 'counterparty'"
          >
            <UIcon name="i-lucide-user" class="size-4" />
            Counterparty
          </button>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <UFormField :label="mode === 'merchant' ? 'Merchant' : 'Counterparty'" required>
            <div class="flex gap-2">
              <UInputMenu
                v-model="selectedItem"
                v-model:search-term="searchTerm"
                :items="searchItems"
                :loading="searchLoading"
                label-key="label"
                :placeholder="`Search ${mode === 'merchant' ? 'merchant' : 'counterparty'}…`"
                class="flex-1"
              />
              <UTooltip :text="`Add new ${mode === 'merchant' ? 'merchant' : 'counterparty'}`">
                <UButton icon="i-lucide-plus" color="neutral" variant="outline" @click="openNewModal" />
              </UTooltip>
            </div>
          </UFormField>

          <UFormField label="Account" required>
            <USelect
              v-model="selectedAccount"
              :items="accountOptions"
              value-key="value"
              label-key="label"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Category">
            <USelect
              v-model="selectedCategoryId"
              :items="categoryOptions"
              value-key="value"
              label-key="label"
              placeholder="None"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Selected indicator — full width so IBAN never wraps or gets cut -->
        <div
          v-if="selectedItem"
          class="flex items-center gap-3 px-4 py-3 rounded-lg bg-success/10 border border-success/20"
        >
          <UIcon name="i-lucide-check-circle" class="size-5 text-success shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">{{ selectedItem.name ?? selectedItem.label }}</p>
            <p v-if="selectedItem.iban" class="text-xs text-muted font-mono mt-0.5">{{ selectedItem.iban }}</p>
          </div>
          <UButton
            icon="i-lucide-x"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="selectedItem = null; searchTerm = ''"
          />
        </div>
      </div>
    </UCard>

    <!-- Editable transaction table -->
    <UCard>
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-muted uppercase tracking-wide">Transactions</p>
          <div class="flex items-center gap-2">
            <!-- CSV upload -->
            <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="onFileChange" />
            <UButton
              label="Import CSV"
              icon="i-lucide-file-up"
              color="neutral"
              variant="outline"
              size="sm"
              @click="fileInput?.click()"
            />
            <div
              class="hidden"
              @dragover="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop"
            />
            <UButton
              label="Add row"
              icon="i-lucide-plus"
              size="sm"
              @click="addRow"
            />
          </div>
        </div>

        <UAlert
          v-if="parseError"
          :title="parseError"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
        />

        <p class="text-xs text-muted">
          CSV format: <span class="font-mono">date, amount, note</span> — comma or semicolon separator.
          Date must be <span class="font-mono font-medium">YYYY-MM-DD</span> (e.g. <span class="font-mono">2024-03-15</span>).
          Positive amounts = incoming, negative = outgoing.
        </p>

        <!-- Drop zone overlay hint -->
        <div
          class="border-2 border-dashed rounded-lg border-default p-3 text-center text-xs text-muted cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
          @click="fileInput?.click()"
        >
          <UIcon name="i-lucide-upload-cloud" class="size-4 inline mr-1" />
          Drop a CSV here to populate the table
        </div>

        <div
          v-if="rows.length === 0"
          class="text-center py-8 text-sm text-muted"
        >
          No rows yet — add one manually or import a CSV.
        </div>

        <div
          v-else
          class="rounded-lg border border-default overflow-hidden"
        >
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-elevated border-b border-default">
                <th class="text-left px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide w-36">
                  Date
                </th>
                <th class="text-left px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide w-44">
                  Amount
                </th>
                <th class="text-left px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">
                  Note
                </th>
                <th class="px-3 py-2 w-8" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in rows"
                :key="row.id"
                class="border-b border-default last:border-0"
              >
                <!-- Date -->
                <td class="px-2 py-1.5">
                  <input
                    v-model="row.date"
                    type="date"
                    class="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5 font-mono"
                  />
                </td>

                <!-- Amount with direction toggle -->
                <td class="px-2 py-1.5">
                  <div class="flex rounded border border-default overflow-hidden">
                    <button
                      class="flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors border-r border-default shrink-0"
                      :class="row.direction === 'outgoing' ? 'bg-error/15 text-error' : 'text-muted hover:bg-elevated'"
                      @click="row.direction = 'outgoing'"
                    >
                      <UIcon name="i-lucide-arrow-up" class="size-3" />
                      Out
                    </button>
                    <button
                      class="flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors border-r border-default shrink-0"
                      :class="row.direction === 'incoming' ? 'bg-success/15 text-success' : 'text-muted hover:bg-elevated'"
                      @click="row.direction = 'incoming'"
                    >
                      <UIcon name="i-lucide-arrow-down" class="size-3" />
                      In
                    </button>
                    <input
                      v-model.number="row.amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      class="flex-1 min-w-0 bg-transparent px-2 py-1 text-sm outline-none"
                    />
                  </div>
                </td>

                <!-- Note -->
                <td class="px-2 py-1.5">
                  <input
                    v-model="row.note"
                    type="text"
                    placeholder="Optional note…"
                    class="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5"
                  />
                </td>

                <!-- Delete -->
                <td class="px-2 py-1.5 text-right">
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="xs"
                    @click="removeRow(row.id)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="rows.length > 0"
          class="flex items-center justify-between text-sm text-muted px-1"
        >
          <span>{{ validRows.length }} of {{ rows.length }} rows valid</span>
          <UButton
            label="Clear all"
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-lucide-trash-2"
            @click="resetAll"
          />
        </div>
      </div>
    </UCard>

    <!-- Progress + result -->
    <div
      v-if="submitting || importResult"
      class="flex flex-col gap-2"
    >
      <div
        v-if="submitting"
        class="flex flex-col gap-2"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted">Importing…</span>
          <span class="font-medium">{{ progress }}%</span>
        </div>
        <div class="h-2 rounded-full bg-muted/30 overflow-hidden">
          <div
            class="h-full bg-primary rounded-full transition-all"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>
      <UAlert
        v-if="importResult"
        :title="`${importResult.imported} transactions imported${importResult.failed ? `, ${importResult.failed} failed` : ''}`"
        :color="importResult.failed === 0 ? 'success' : 'warning'"
        variant="subtle"
        :icon="importResult.failed === 0 ? 'i-lucide-check-circle' : 'i-lucide-alert-triangle'"
      />
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-2">
      <UButton
        v-if="importResult"
        label="Start over"
        color="neutral"
        variant="outline"
        icon="i-lucide-refresh-cw"
        @click="resetAll"
      />
      <UButton
        label="Import all"
        icon="i-lucide-upload"
        :loading="submitting"
        :disabled="validRows.length === 0 || !selectedItem || !!importResult"
        @click="handleImport"
      />
    </div>
  </div>

  <!-- New merchant / counterparty modal -->
  <UModal v-model:open="showNewModal" :title="`Add New ${mode === 'merchant' ? 'Merchant' : 'Counterparty'}`">
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Name" required>
          <UInput v-model="newName" placeholder="e.g. Billa" class="w-full" autofocus />
        </UFormField>
        <UFormField v-if="mode === 'counterparty'" label="IBAN">
          <UInput v-model="newIban" placeholder="AT83…" class="w-full font-mono" />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" color="neutral" variant="outline" @click="showNewModal = false" />
        <UButton label="Add" :disabled="!newName.trim()" @click="confirmNew" />
      </div>
    </template>
  </UModal>
</template>
