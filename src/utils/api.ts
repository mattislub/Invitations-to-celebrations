export const getApiBaseUrl = () => {
  const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  const baseUrl = (configuredApiBaseUrl && configuredApiBaseUrl !== '')
    ? configuredApiBaseUrl
    : (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api')

  return baseUrl.replace(/\/$/, '')
}
