<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const collapsed = ref(false)

defineShortcuts({
  c: () => (collapsed.value = !collapsed.value)
})

const navMain: NavigationMenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    to: '/dashboard'
  },
  {
    label: 'Transactions',
    icon: 'i-lucide-list',
    to: '/transactions'
  },
  {
    label: 'Import CSV',
    icon: 'i-lucide-upload',
    to: '/import'
  },
  {
    label: 'Categories',
    icon: 'i-lucide-tag',
    to: '/categories'
  },
  {
    label: 'Accounts',
    icon: 'i-lucide-wallet',
    to: '/accounts'
  },
  {
    label: 'Merchant Aliases',
    icon: 'i-lucide-repeat',
    to: '/merchant-aliases'
  },
  {
    label: 'Transaction Rules',
    icon: 'i-lucide-filter',
    to: '/transaction-rules'
  },
  {
    label: 'Asset Rules',
    icon: 'i-lucide-chart-candlestick',
    to: '/asset-rules'
  },
  {
    label: 'MCC Mappings',
    icon: 'i-lucide-credit-card',
    to: '/mcc-mappings'
  }
]

const navBottom: NavigationMenuItem[] = [
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    to: 'https://github.com',
    target: '_blank'
  }
]
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      v-model:collapsed="collapsed"
      collapsible
      resizable
      :min-size="12"
      :max-size="22"
      :default-size="16"
    >
      <template #header="{ collapsed: isCollapsed }">
        <div class="flex items-center gap-2 px-2 py-1">
          <UIcon
            name="i-lucide-trending-up"
            class="size-6 text-primary shrink-0"
          />
          <span
            v-if="!isCollapsed"
            class="font-semibold text-sm truncate"
          >
            Financials Tracker
          </span>
        </div>
      </template>

      <template #default="{ collapsed: isCollapsed }">
        <UNavigationMenu
          :collapsed="isCollapsed"
          :items="navMain"
          orientation="vertical"
        />
        <UNavigationMenu
          :collapsed="isCollapsed"
          :items="navBottom"
          orientation="vertical"
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed: isCollapsed }">
        <div class="flex items-center gap-2 p-2">
          <UAvatar
            icon="i-lucide-user"
            size="sm"
          />
          <span
            v-if="!isCollapsed"
            class="text-sm text-muted truncate"
          >
            Admin
          </span>
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
