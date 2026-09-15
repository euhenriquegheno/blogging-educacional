import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient, clearStoredToken, setStoredToken } from './api-client'

describe('apiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    clearStoredToken()
  })

  it('injeta o header Authorization quando há token salvo', async () => {
    setStoredToken('meu-token')
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiClient('/posts')

    const [, init] = fetchMock.mock.calls[0]
    const headers = new Headers(init?.headers)
    expect(headers.get('Authorization')).toBe('Bearer meu-token')
  })

  it('não injeta o header Authorization quando não há token salvo', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiClient('/posts')

    const [, init] = fetchMock.mock.calls[0]
    const headers = new Headers(init?.headers)
    expect(headers.get('Authorization')).toBeNull()
  })

  it('lança um erro tipado com status e mensagem quando a resposta não é 2xx', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiClient('/posts/999')).rejects.toMatchObject({
      message: 'Não encontrado',
      status: 404,
    })
  })

  it('retorna os dados JSON decodificados quando a resposta é 2xx', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const data = await apiClient('/posts/1')
    expect(data).toEqual({ id: 1 })
  })
})
