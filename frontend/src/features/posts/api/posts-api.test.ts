import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createPost,
  deletePost,
  getPost,
  listPosts,
  searchPosts,
  updatePost,
} from './posts-api'
import { setStoredToken } from '../../../services/api-client'

const publicacaoMock = {
  id: '1',
  titulo: 'Aprendendo MySQL',
  conteudo: 'Conteúdo sobre MySQL',
  usuario: { id: '10', nome: 'Prof. Ana', email: 'ana@escola.com', tipo: 'PROFESSOR' },
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: body === null ? undefined : { 'Content-Type': 'application/json' },
  })
}

describe('posts-api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('listPosts(1, 10) chama GET /posts?page=1&limit=10 e retorna Publicacao[] tipado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([publicacaoMock]))
    vi.stubGlobal('fetch', fetchMock)

    const result = await listPosts(1, 10)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/posts?page=1&limit=10')
    expect(init?.method ?? 'GET').toBe('GET')
    expect(result).toEqual([publicacaoMock])
  })

  it("searchPosts('mysql') chama GET /posts/search?q=mysql", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([publicacaoMock]))
    vi.stubGlobal('fetch', fetchMock)

    const result = await searchPosts('mysql')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/posts/search?q=mysql')
    expect(result).toEqual([publicacaoMock])
  })

  it('getPost(id) chama GET /posts/:id e retorna a Publicacao', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(publicacaoMock))
    vi.stubGlobal('fetch', fetchMock)

    const result = await getPost('1')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/posts/1')
    expect(result).toEqual(publicacaoMock)
  })

  it('createPost envia POST /posts com { titulo, conteudo } e header Authorization, sem campo de autor', async () => {
    setStoredToken('meu-token')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(publicacaoMock, 201))
    vi.stubGlobal('fetch', fetchMock)

    const result = await createPost({ titulo: 'Aprendendo MySQL', conteudo: 'Conteúdo sobre MySQL' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/posts')
    expect(init?.method).toBe('POST')
    const body = JSON.parse(init?.body as string)
    expect(body).toEqual({ titulo: 'Aprendendo MySQL', conteudo: 'Conteúdo sobre MySQL' })
    expect(body).not.toHaveProperty('usuario_id')
    expect(body).not.toHaveProperty('usuarioId')
    expect(body).not.toHaveProperty('autor')
    const headers = new Headers(init?.headers)
    expect(headers.get('Authorization')).toBe('Bearer meu-token')
    expect(result).toEqual(publicacaoMock)
  })

  it('updatePost envia PUT /posts/:id com { titulo, conteudo }, sem campo de autor', async () => {
    setStoredToken('meu-token')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(publicacaoMock, 200))
    vi.stubGlobal('fetch', fetchMock)

    const result = await updatePost('1', { titulo: 'Novo título', conteudo: 'Novo conteúdo' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/posts/1')
    expect(init?.method).toBe('PUT')
    const body = JSON.parse(init?.body as string)
    expect(body).toEqual({ titulo: 'Novo título', conteudo: 'Novo conteúdo' })
    expect(body).not.toHaveProperty('usuario_id')
    expect(result).toEqual(publicacaoMock)
  })

  it('deletePost envia DELETE /posts/:id com header Authorization', async () => {
    setStoredToken('meu-token')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null, 204))
    vi.stubGlobal('fetch', fetchMock)

    await deletePost('1')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/posts/1')
    expect(init?.method).toBe('DELETE')
    const headers = new Headers(init?.headers)
    expect(headers.get('Authorization')).toBe('Bearer meu-token')
  })
})
