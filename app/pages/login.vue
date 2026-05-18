<script setup lang="ts">
definePageMeta({ layout: false })

const { login } = useAuth()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(username.value, password.value)
    router.push('/dashboard')
  } catch {
    error.value = 'Invalid username or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex h-screen items-center justify-center bg-background">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-trending-up"
            class="size-6 text-primary"
          />
          <span class="font-semibold text-lg">Financials Tracker</span>
        </div>
      </template>

      <UForm
        class="space-y-4"
        @submit.prevent="handleLogin"
      >
        <UFormField label="Username">
          <UInput
            v-model="username"
            placeholder="Username"
            autocomplete="username"
            :disabled="loading"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Password">
          <UInput
            v-model="password"
            type="password"
            placeholder="Password"
            autocomplete="current-password"
            :disabled="loading"
            class="w-full"
          />
        </UFormField>

        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          :description="error"
        />

        <UButton
          type="submit"
          :loading="loading"
          block
        >
          Sign in
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
