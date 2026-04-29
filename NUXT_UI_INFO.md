# Nuxt UI v4.7.0 — Dashboard Reference

## Overview

Nuxt UI Pro provides dashboard-specific components for building admin interfaces with responsive sidebars, resizable panels, search modals, and navigation bars. All components integrate with each other and share state through `DashboardGroup`.

---

## Dashboard Layout Structure

```
UApp
└── UDashboardGroup
    ├── UDashboardSidebar
    │   ├── #header slot
    │   ├── #default slot  (nav items, search button, etc.)
    │   └── #footer slot   (user avatar, etc.)
    └── UDashboardPanel (one or more)
        ├── #header slot → UDashboardNavbar
        ├── #body slot   (scrollable, padded)
        └── #footer slot
```

Typical layout file:

```vue
<!-- layouts/dashboard.vue -->
<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
      <template #header="{ collapsed }">
        <Logo v-if="!collapsed" />
        <UDashboardSidebarCollapse />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu :collapsed="collapsed" :items="navItems" orientation="vertical" />
      </template>

      <template #footer="{ collapsed }">
        <UButton :label="collapsed ? undefined : 'User'" color="neutral" variant="ghost" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
```

Page usage:

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- page content -->
    </template>
  </UDashboardPanel>
</template>
```

---

## Dashboard Components

### `UApp`

Wraps the entire application. Required for toasts, tooltips, modals, and global config to work.

```vue
<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
```

Key props: `tooltip`, `toaster`, `locale`, `dir` (`ltr`/`rtl`), `portal`

---

### `UDashboardGroup`

Fixed full-screen layout wrapper. Provides context (sidebar state, size persistence) to all child dashboard components.

| Prop | Default | Description |
|------|---------|-------------|
| `storage` | `'cookie'` | `'cookie'` or `'local'` |
| `storageKey` | `'dashboard'` | Key used to persist sidebar size |
| `persistent` | `true` | Whether to persist sidebar size |
| `unit` | `'%'` | Size unit: `'%'`, `'rem'`, or `'px'` |

---

### `UDashboardSidebar`

Resizable and collapsible sidebar. On mobile it renders as a slideover/drawer/modal. On desktop it is a fixed side panel.

| Prop | Default | Description |
|------|---------|-------------|
| `resizable` | `false` | Allow drag-to-resize |
| `collapsible` | `false` | Allow collapsing by dragging to edge |
| `collapsedSize` | `0` | Size when collapsed (sidebar has min-w-16) |
| `minSize` | `10` | Min size (%) |
| `maxSize` | `20` | Max size (%) |
| `defaultSize` | `15` | Default size (%) |
| `side` | `'left'` | `'left'` or `'right'` |
| `mode` | `'slideover'` | Mobile menu mode: `'slideover'`, `'drawer'`, `'modal'` |
| `open` | `false` | Control mobile open state (`v-model:open`) |
| `collapsed` | `false` | Control desktop collapsed state (`v-model:collapsed`) |
| `autoClose` | `true` | Close on route change (mobile) |
| `toggle` | `true` | Show/customize the mobile toggle button |
| `toggleSide` | `'left'` | Side of the toggle button |

Slots:

| Slot | Slot props | Description |
|------|-----------|-------------|
| `#header` | `{ collapsed, collapse }` | Top of sidebar (logo, collapse button) |
| `#default` | `{ collapsed, collapse }` | Main nav content |
| `#footer` | `{ collapsed, collapse }` | Bottom of sidebar (user info) |
| `#content` | `{ close }` | Override entire mobile menu |

Controlling collapsed state with keyboard shortcut:

```vue
<script setup lang="ts">
const collapsed = ref(false)
defineShortcuts({ c: () => collapsed.value = !collapsed.value })
</script>

<template>
  <UDashboardSidebar v-model:collapsed="collapsed" collapsible>
    <template #default="{ collapsed }">
      <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />
    </template>
  </UDashboardSidebar>
</template>
```

---

### `UDashboardPanel`

A resizable content panel. Use multiple panels side-by-side for split views.

| Prop | Default | Description |
|------|---------|-------------|
| `id` | auto | Unique ID (required for multi-panel pages) |
| `resizable` | `false` | Allow resizing |
| `minSize` | `15` | Min size (%) |
| `maxSize` | `100` | Max size (%) |
| `defaultSize` | `0` | Default size (0 = flex-1) |

Slots:

| Slot | Description |
|------|-------------|
| `#header` | Navbar area (use `UDashboardNavbar` here) |
| `#body` | Scrollable, padded content area |
| `#footer` | Bottom toolbar area |
| `#default` | Full panel override (no scroll/padding) |

Note: When `resizable` is true the component has no single root element. Wrap in `<div class="flex flex-1">` if using page transitions.

Multi-panel example:

```vue
<template>
  <UDashboardPanel id="list" resizable :default-size="35" />
  <UDashboardPanel id="detail" class="hidden lg:flex" />
</template>
```

---

### `UDashboardNavbar`

Responsive top navigation bar for panels. Includes a mobile toggle for the sidebar.

| Prop | Default | Description |
|------|---------|-------------|
| `title` | — | Navbar title text |
| `icon` | — | Icon next to title |
| `toggle` | `true` | Show/customize mobile sidebar toggle |
| `toggleSide` | `'left'` | Side of the mobile toggle |

Slots:

| Slot | Description |
|------|-------------|
| `#leading` | Left of title (good place for `UDashboardSidebarCollapse`) |
| `#trailing` | Right of title (badges, counters) |
| `#left` | Far left area |
| `#default` | Center area (hidden on mobile) |
| `#right` | Far right area (tabs, actions) |

```vue
<UDashboardNavbar title="Inbox">
  <template #leading>
    <UDashboardSidebarCollapse />
  </template>
  <template #trailing>
    <UBadge label="4" variant="subtle" />
  </template>
  <template #right>
    <UTabs :items="tabs" size="sm" :content="false" />
  </template>
</UDashboardNavbar>
```

---

### `UDashboardSidebarCollapse`

Button that collapses/expands the sidebar on desktop. Only visible on `lg+` screens. Extends `UButton`.

```vue
<!-- In sidebar header -->
<UDashboardSidebarCollapse variant="subtle" />

<!-- In navbar leading slot -->
<template #leading>
  <UDashboardSidebarCollapse />
</template>
```

Key props: `color` (default `'neutral'`), `variant` (default `'ghost'`), `side` (`'left'`/`'right'`)

---

### `UDashboardSidebarToggle`

Button that opens the sidebar on mobile. Only visible below `lg`. Extends `UButton`. Usually rendered automatically by `UDashboardNavbar` — use this for custom placements.

---

### `UDashboardSearch`

Command palette / search modal for the dashboard. Supports grouped results, keyboard navigation, and custom item rendering.

---

### `UDashboardSearchButton`

Pre-styled button that opens the `UDashboardSearch` modal.

```vue
<UDashboardSearchButton />
```

---

### `UDashboardResizeHandle`

Drag handle between panels/sidebar. Rendered automatically when `resizable` is set — rarely used directly.

---

### `UDashboardToolbar`

A toolbar strip typically used in the `#footer` slot of `UDashboardPanel`.

---

## Common Patterns

### Navigation menu in sidebar

```vue
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[][] = [[
  { label: 'Home', icon: 'i-lucide-house', to: '/' },
  { label: 'Inbox', icon: 'i-lucide-inbox', badge: '4', to: '/inbox' },
  {
    label: 'Settings',
    icon: 'i-lucide-settings',
    defaultOpen: true,
    children: [
      { label: 'General', to: '/settings' },
      { label: 'Members', to: '/settings/members' },
    ]
  },
], [
  { label: 'Help', icon: 'i-lucide-info', to: 'https://example.com', target: '_blank' },
]]
</script>

<template>
  <UDashboardSidebar collapsible resizable>
    <template #default="{ collapsed }">
      <UNavigationMenu :collapsed="collapsed" :items="items[0]" orientation="vertical" />
      <UNavigationMenu :collapsed="collapsed" :items="items[1]" orientation="vertical" class="mt-auto" />
    </template>
  </UDashboardSidebar>
</template>
```

### Search button with keyboard shortcut hint

```vue
<template #default="{ collapsed }">
  <UButton
    :label="collapsed ? undefined : 'Search...'"
    icon="i-lucide-search"
    color="neutral"
    variant="outline"
    block
    :square="collapsed"
  >
    <template v-if="!collapsed" #trailing>
      <UKbd value="meta" variant="subtle" />
      <UKbd value="K" variant="subtle" />
    </template>
  </UButton>
</template>
```

### Keyboard shortcuts for sidebar

```vue
<script setup lang="ts">
const open = ref(true)
const collapsed = ref(false)

defineShortcuts({
  o: () => open.value = !open.value,
  c: () => collapsed.value = !collapsed.value,
})
</script>
```

---

## Other Useful Components

| Component | Use case |
|-----------|----------|
| `UTable` | Data tables with sorting, pagination |
| `UModal` | Dialog/modal overlays |
| `USlideover` | Side panel overlays |
| `UDrawer` | Bottom/side drawer |
| `UDropdownMenu` | Context menus, action menus |
| `UContextMenu` | Right-click menus |
| `UTabs` | Tab navigation |
| `UNavigationMenu` | Vertical/horizontal nav with icons, badges, children |
| `UBreadcrumb` | Page breadcrumb trail |
| `UPagination` | Table/list pagination |
| `UCommandPalette` | Fuzzy search command palette |
| `UForm` + `UFormField` | Forms with Zod/Valibot validation |
| `UInput`, `USelect`, `UTextarea` | Form inputs |
| `UBadge` | Status/count badges |
| `UButton` | Buttons (all variants) |
| `UCard` | Content card container |
| `UToast` | Toast notifications (via `useToast()`) |
| `USkeleton` | Loading placeholders |
| `UAvatar` | User avatars |
| `USeparator` | Dividers |
| `UKbd` | Keyboard shortcut display |
| `UIcon` | Lucide/custom icons |
| `UCollapsible` | Expandable sections |
| `UAccordion` | FAQ/collapsible list |

---

## Icons

Nuxt UI uses Lucide icons by default (`i-lucide-*`). Pass icon names as strings:

```vue
<UButton icon="i-lucide-house" />
<UIcon name="i-lucide-inbox" class="size-5" />
```

---

## Theme Customization

Override component styles globally via `app.config.ts`:

```ts
export default defineAppConfig({
  ui: {
    dashboardSidebar: {
      slots: {
        body: 'flex flex-col gap-4 flex-1 overflow-y-auto px-4 py-2',
      }
    },
    button: {
      defaultVariants: {
        color: 'primary',
        variant: 'solid',
      }
    }
  }
})
```
