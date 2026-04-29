<script setup lang="ts">
import { importSparkasseJson } from '~/services/transactionService'
import type { CsvImportResult } from '~/types/transaction'

const toast = useToast()

const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<CsvImportResult | null>(null)

const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const selectedFile = ref<File | null>(null)

function onDragOver(event: DragEvent) {
  event.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file && file.name.endsWith('.json')) {
    selectedFile.value = file
  }
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] ?? null
}

async function handleUpload() {
  if (!selectedFile.value) return
  loading.value = true
  error.value = null
  result.value = null
  try {
    result.value = await importSparkasseJson(selectedFile.value)
    toast.add({
      title: `Import complete: ${result.value.imported} imported, ${result.value.skipped} skipped`,
      color: 'success',
      icon: 'i-lucide-check'
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Import failed'
  } finally {
    loading.value = false
  }
}

function handleReset() {
  error.value = null
  result.value = null
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <UAlert
      title="Sparkasse JSON Export"
      description="Upload the JSON file exported from your Sparkasse online banking. Re-importing the same file is safe — duplicates are automatically skipped."
      icon="i-lucide-info"
      color="info"
      variant="subtle"
    />

    <div
      class="border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-colors"
      :class="dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20' : 'border-default hover:border-muted'"
      @click="fileInput?.click()"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        class="hidden"
        @change="onFileChange"
      />
      <UIcon
        name="i-lucide-upload-cloud"
        class="size-12 text-muted"
      />
      <div class="text-center">
        <p class="font-medium">
          Drop your CSV here or click to browse
        </p>
        <p class="text-sm text-muted mt-1">
          Only .json files are accepted
        </p>
      </div>
      <div
        v-if="selectedFile"
        class="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-lg"
        @click.stop
      >
        <UIcon
          name="i-lucide-file-text"
          class="size-4 text-primary"
        />
        <span class="text-sm font-medium">{{ selectedFile.name }}</span>
        <span class="text-xs text-muted">{{ (selectedFile.size / 1024).toFixed(1) }} KB</span>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          @click.stop="handleReset"
        />
      </div>
    </div>

    <UAlert
      v-if="error"
      :title="error"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
    />

    <div
      v-if="result"
      class="flex flex-col gap-4"
    >
      <ImportImportResultSummary :result="result" />
      <UButton
        label="Import another file"
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="outline"
        @click="handleReset"
      />
    </div>

    <div
      v-if="!result"
      class="flex justify-end"
    >
      <UButton
        label="Import"
        icon="i-lucide-upload"
        :loading="loading"
        :disabled="!selectedFile"
        @click="handleUpload"
      />
    </div>
  </div>
</template>
