export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = event.context.params?.path ?? ''
  const search = new URL(event.path, 'http://localhost').search
  const target = `${config.apiBaseUrl}/${path}${search}`
  return proxyRequest(event, target)
})
