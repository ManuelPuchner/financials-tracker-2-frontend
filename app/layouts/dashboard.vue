<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const collapsed = ref(false)
const { searchTerm, groups, loading } = useSearch()
const { logout } = useAuth()

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
    label: 'Data',
    icon: 'i-lucide-database',
    defaultOpen: true,
    children: [
      {
        label: 'Transactions',
        icon: 'i-lucide-list',
        to: '/transactions'
      },
      {
        label: 'Bargeld',
        icon: 'i-lucide-banknote',
        to: '/cash'
      },
      {
        label: 'Import',
        icon: 'i-lucide-upload',
        to: '/import'
      },
      {
        label: 'Entities',
        icon: 'i-lucide-building-2',
        to: '/entities'
      }
    ]
  },
  {
    label: 'Configuration',
    icon: 'i-lucide-settings-2',
    defaultOpen: true,
    children: [
      {
        label: 'Accounts',
        icon: 'i-lucide-wallet',
        to: '/accounts'
      },
      {
        label: 'Categories',
        icon: 'i-lucide-tag',
        to: '/categories'
      },
      {
        label: 'Rules',
        icon: 'i-lucide-list',
        children: [
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
            label: 'Merchant Aliases',
            icon: 'i-lucide-repeat',
            to: '/merchant-aliases'
          },
          {
            label: 'Counterparty Mappings',
            icon: 'i-lucide-link',
            to: '/counterparty-merchant-mappings'
          },
          {
            label: 'MCC Mappings',
            icon: 'i-lucide-credit-card',
            to: '/mcc-mappings'
          }
        ]
      }
    ]
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
        <UDashboardSearchButton
          :collapsed="isCollapsed"
          class="mb-1"
        />
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
            class="text-sm text-muted truncate flex-1"
          >
            Admin
          </span>
          <UButton
            v-if="!isCollapsed"
            icon="i-lucide-log-out"
            variant="ghost"
            size="xs"
            @click="logout"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <slot />

    <UDashboardSearch
      v-model:search-term="searchTerm"
      :groups="groups"
      :loading="loading"
      placeholder="Search merchants, counterparties, assets…"
      :color-mode="false"
    />
  </UDashboardGroup>
</template>
