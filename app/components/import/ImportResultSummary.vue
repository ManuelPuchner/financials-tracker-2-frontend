<script setup lang="ts">
import type { CsvImportResult } from '~/types/transaction'

defineProps<{
  result: CsvImportResult
}>()
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <UCard>
      <div class="flex flex-col items-center gap-1 py-2">
        <span class="text-3xl font-bold">{{ result.total }}</span>
        <span class="text-sm text-muted">Total rows</span>
      </div>
    </UCard>
    <UCard>
      <div class="flex flex-col items-center gap-1 py-2">
        <span class="text-3xl font-bold text-success-500">{{ result.imported }}</span>
        <span class="text-sm text-muted">Imported</span>
      </div>
    </UCard>
    <UCard>
      <div class="flex flex-col items-center gap-1 py-2">
        <span class="text-3xl font-bold text-neutral-400">{{ result.skipped }}</span>
        <span class="text-sm text-muted">Skipped (duplicates)</span>
      </div>
    </UCard>
  </div>
</template>
