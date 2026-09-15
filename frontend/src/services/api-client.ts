const TOKEN_STORAGE_KEY = 'api-blogging:token'

/**
 * Erro tipado lançado pelo apiClient quando a API responde com um status
 * fora da faixa 2xx. Carrega o status HTTP e o corpo (já decodificado)
 * retornado pela API, quando disponível.
 */
export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

interface ApiErrorPayload {
  message?: unknown
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // localStorage indisponível (ex.: modo privado) — ignora silenciosamente
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // localStorage indisponível — ignora silenciosamente
  }
}

function getBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? ''
}

function isJsonResponse(response: Response): boolean {
  return response.headers.get('content-type')?.includes('application/json') ?? false
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || !isJsonResponse(response)) {
    return null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

function extractErrorMessage(data: unknown, response: Response): string {
  if (data && typeof data === 'object' && typeof (data as ApiErrorPayload).message === 'string') {
    return (data as ApiErrorPayload).message as string
  }

  return response.statusText || 'Erro ao comunicar com a API'
}

/**
 * Cliente HTTP fino sobre o `fetch` nativo. Resolve a URL a partir de
 * `VITE_API_URL`, injeta o header `Authorization` quando há um token salvo
 * e lança `ApiError` para respostas fora da faixa 2xx.
 */
export async function apiClient<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
  })

  const data = await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(data, response), response.status, data)
  }

  return data as T
}
