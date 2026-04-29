<script setup lang="ts">
import { useCsvImport } from '~/composables/useCsvImport'

const { loading, error, result, upload, reset } = useCsvImport()
const toast = useToast()

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
  if (file && file.name.endsWith('.csv')) {
    selectedFile.value = file
  }
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] ?? null
}

async function handleUpload() {
  if (!selectedFile.value) return
  await upload(selectedFile.value)
  if (result.value) {
    toast.add({
      title: `Import complete: ${result.value.imported} imported, ${result.value.skipped} skipped`,
      color: 'success',
      icon: 'i-lucide-check'
    })
  }
}

function handleReset() {
  reset()
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <UAlert
      title="Trade Republic CSV Export"
      description="Upload the CSV file exported directly from your Trade Republic account. Duplicate transactions are automatically skipped."
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
        accept=".csv"
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
          Only .csv files are accepted
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
      <ImportResultSummary :result="result" />
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
