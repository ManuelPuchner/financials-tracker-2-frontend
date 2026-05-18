export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const { isLoggedIn } = useAuth()
  if (to.path === '/login') {
    if (isLoggedIn()) return navigateTo('/dashboard')
    return
  }
  if (!isLoggedIn()) {
    return navigateTo('/login')
  }
})
