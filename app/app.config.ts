export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'slate'
    },
    dashboardSidebar: {
      slots: {
        body: 'flex flex-col gap-2 flex-1 overflow-y-auto px-2 py-2'
      }
    }
  }
})
