export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'slate'
    },
    dashboardNavbar: {
      slots: {
        root: 'pt-(--safe-top)'
      }
    },
    dashboardSidebar: {
      slots: {
        body: 'flex flex-col gap-2 flex-1 overflow-y-auto px-2 py-2',
        header: 'pt-(--safe-top)'
      }
    }
  }
})
