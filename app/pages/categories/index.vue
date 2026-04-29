<script setup lang="ts">
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '~/services/categoryService'
import type { UserCategory, UserCategoryRequest } from '~/types/transaction'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Categories — Financials Tracker' })

const toast = useToast()

const categories = ref<UserCategory[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingCategory = ref<UserCategory | null>(null)
const saving = ref(false)

const form = reactive<UserCategoryRequest>({
  name: '',
  color: '#6366f1',
  icon: ''
})

async function load() {
  loading.value = true
  try {
    categories.value = await fetchCategories()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingCategory.value = null
  form.name = ''
  form.color = '#6366f1'
  form.icon = ''
  showModal.value = true
}

function openEdit(cat: UserCategory) {
  editingCategory.value = cat
  form.name = cat.name
  form.color = cat.color ?? '#6366f1'
  form.icon = cat.icon ?? ''
  showModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    const payload: UserCategoryRequest = {
      name: form.name,
      color: form.color || undefined,
      icon: form.icon || undefined
    }
    if (editingCategory.value) {
      const updated = await updateCategory(editingCategory.value.id, payload)
      const idx = categories.value.findIndex(c => c.id === updated.id)
      if (idx !== -1) categories.value[idx] = updated
      toast.add({ title: 'Category updated', color: 'success', icon: 'i-lucide-check' })
    } else {
      const created = await createCategory(payload)
      categories.value.push(created)
      toast.add({ title: 'Category created', color: 'success', icon: 'i-lucide-check' })
    }
    showModal.value = false
  } catch (err) {
    toast.add({ title: err instanceof Error ? err.message : 'Save failed', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    saving.value = false
  }
}

async function handleDelete(cat: UserCategory) {
  try {
    await deleteCategory(cat.id)
    categories.value = categories.value.filter(c => c.id !== cat.id)
    toast.add({ title: `"${cat.name}" deleted`, color: 'success', icon: 'i-lucide-check' })
  } catch (err) {
    toast.add({ title: err instanceof Error ? err.message : 'Delete failed', color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

onMounted(load)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Categories">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="New Category"
            icon="i-lucide-plus"
            size="sm"
            @click="openCreate"
          />
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
          v-else-if="categories.length === 0"
          class="text-muted text-sm py-8 text-center"
        >
          No categories yet. Create one to get started.
        </div>

        <div
          v-else
          class="flex flex-col gap-2"
        >
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="flex items-center gap-3 px-4 py-3 rounded-lg border border-default bg-background"
          >
            <span
              class="size-4 rounded-full shrink-0"
              :style="{ backgroundColor: cat.color ?? '#888' }"
            />
            <span class="font-medium flex-1">{{ cat.name }}</span>
            <span
              v-if="cat.icon"
              class="text-xs text-muted"
            >{{ cat.icon }}</span>
            <div class="flex items-center gap-1">
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="openEdit(cat)"
              />
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                @click="handleDelete(cat)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="showModal"
    :title="editingCategory ? 'Edit Category' : 'New Category'"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Name" required>
          <UInput
            v-model="form.name"
            placeholder="e.g. Restaurants"
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
              placeholder="#6366f1"
              class="flex-1 font-mono"
            />
          </div>
        </UFormField>
        <UFormField label="Icon">
          <UInput
            v-model="form.icon"
            placeholder="e.g. shopping-cart"
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
          :label="editingCategory ? 'Save' : 'Create'"
          :loading="saving"
          :disabled="!form.name.trim()"
          @click="handleSave"
        />
      </div>
    </template>
  </UModal>
</template>
