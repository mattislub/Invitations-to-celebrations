const sanitizeBaseUrl = (value: string) => value.replace(/\/$/, '')

const getDefaultApiBaseUrl = () => typeof window !== 'undefined'
  ? `${window.location.origin}/api`
  : '/api'

export const getApiBaseUrlCandidates = () => {
  const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  const candidates = [] as string[]

  if (configuredApiBaseUrl) {
    candidates.push(sanitizeBaseUrl(configuredApiBaseUrl))
  }

  const defaultBase = sanitizeBaseUrl(getDefaultApiBaseUrl())
  if (!candidates.includes(defaultBase)) {
    candidates.push(defaultBase)
  }

  if (candidates.length === 0) {
    candidates.push('/api')
  }

  return candidates
}

export const getApiBaseUrl = () => getApiBaseUrlCandidates()[0]

export const fetchWithApiFallback = async (path: string, init?: RequestInit, candidates = getApiBaseUrlCandidates()) => {
  let lastResponse: Response | null = null
  let lastError: unknown

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, init)
      if (response.ok) {
        return { response, baseUrl }
      }

      lastResponse = response
    } catch (error) {
      lastError = error
    }
  }

  if (lastResponse) {
    return { response: lastResponse, baseUrl: candidates[0] }
  }

  throw lastError ?? new Error('Unable to reach API base URLs')
}
