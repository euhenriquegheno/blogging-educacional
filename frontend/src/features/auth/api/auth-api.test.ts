import { afterEach, describe, expect, it, vi } from 'vitest'
import { login } from './auth-api'

describe('login', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('faz POST /login com { email, senha } e retorna { token } quando a API responde 200', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ token: 'jwt-token-123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await login('professor@escola.com', 'senha123')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/login')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({ email: 'professor@escola.com', senha: 'senha123' })
    expect(result).toEqual({ token: 'jwt-token-123' })
  })

  it('rejeita com um erro contendo a mensagem da API quando a resposta é 401', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Credenciais inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(login('professor@escola.com', 'senha-errada')).rejects.toThrow('Credenciais inválidas')
  })
})
