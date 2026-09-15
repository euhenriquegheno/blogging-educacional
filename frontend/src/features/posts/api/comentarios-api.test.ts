import { afterEach, describe, expect, it, vi } from 'vitest'
import { createComentario, listComentarios } from './comentarios-api'

describe('comentarios-api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  describe('createComentario', () => {
    it('envia POST /posts/:id/comments com o header Authorization presente', async () => {
      localStorage.setItem('api-blogging:token', 'jwt-token-123')

      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            id: 'comentario-1',
            conteudo: 'Ótimo post!',
            criadoEm: new Date().toISOString(),
            usuario: { id: 1, nome: 'Aluno', email: 'aluno@escola.com', tipo: 'ALUNO' },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      vi.stubGlobal('fetch', fetchMock)

      const result = await createComentario('post-1', 'Ótimo post!')

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(String(url)).toContain('/posts/post-1/comments')
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({ conteudo: 'Ótimo post!' })

      const headers = new Headers(init?.headers)
      expect(headers.get('Authorization')).toBe('Bearer jwt-token-123')
      expect(result.conteudo).toBe('Ótimo post!')
    })
  })

  describe('listComentarios', () => {
    it('chama GET /posts/:id/comments com page e limit', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      vi.stubGlobal('fetch', fetchMock)

      await listComentarios('post-1', 1, 10)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(String(url)).toContain('/posts/post-1/comments?page=1&limit=10')
      expect(init?.method ?? 'GET').toBe('GET')
    })

    it('retorna [] quando a API responde 200 com corpo vazio', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(null, {
          status: 200,
        }),
      )
      vi.stubGlobal('fetch', fetchMock)

      const result = await listComentarios('post-1', 1, 10)

      expect(result).toEqual([])
    })
  })
})
