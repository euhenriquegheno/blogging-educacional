import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, useLocation, useRoutes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { criarTokenFake } from '../../test/jwt'
import { AuthProvider } from '../../features/auth/context/auth-context'
import { listComentarios } from '../../features/posts/api/comentarios-api'
import { getPost, listPosts } from '../../features/posts/api/posts-api'
import type { Publicacao } from '../../types/publicacao'
import { routes } from './router'

vi.mock('../../features/posts/api/posts-api', () => ({
  listPosts: vi.fn(),
  searchPosts: vi.fn(),
  getPost: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
}))

vi.mock('../../features/posts/api/comentarios-api', () => ({
  listComentarios: vi.fn(),
  createComentario: vi.fn(),
}))

const TOKEN_STORAGE_KEY = 'blogging-educacional:token'

const postMock: Publicacao = {
  id: '42',
  titulo: 'Post de teste',
  conteudo: 'Conteúdo de teste',
  usuario: { id: 2, nome: 'Prof. João', email: 'joao@escola.com', tipo: 'PROFESSOR' },
}

function RoutesRenderer() {
  return useRoutes(routes)
}

function LocationDisplay() {
  const location = useLocation()
  return <span data-testid="location-display">{location.pathname}</span>
}

function renderizarRota(initialEntries: string[]) {
  const { container } = render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <RoutesRenderer />
        <LocationDisplay />
      </MemoryRouter>
    </AuthProvider>,
  )

  return () => within(container).getByTestId('location-display').textContent
}

describe('router', () => {
  beforeEach(() => {
    window.localStorage.clear()

    vi.mocked(listPosts).mockReset().mockResolvedValue([])
    vi.mocked(getPost).mockReset().mockResolvedValue(postMock)
    vi.mocked(listComentarios).mockReset().mockResolvedValue([])
  })

  it('redireciona para /login ao navegar para /admin sem autenticação', () => {
    const pathname = renderizarRota(['/admin'])

    expect(pathname()).toBe('/login')
  })

  it('redireciona para /login ao navegar para /admin/usuarios/novo sem autenticação', () => {
    const pathname = renderizarRota(['/admin/usuarios/novo'])

    expect(pathname()).toBe('/login')
  })

  it('redireciona para /login ao navegar para /posts/42/editar sem autenticação', () => {
    const pathname = renderizarRota(['/posts/42/editar'])

    expect(pathname()).toBe('/login')
  })

  it('redireciona para / ao navegar para /posts/novo autenticado como ALUNO', async () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, criarTokenFake({ sub: 3, tipo: 3 }))

    const pathname = renderizarRota(['/posts/novo'])

    await waitFor(() => expect(pathname()).toBe('/'))
  })

  it('redireciona para / ao navegar para /posts/42/editar autenticado como ALUNO', async () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, criarTokenFake({ sub: 3, tipo: 3 }))

    const pathname = renderizarRota(['/posts/42/editar'])

    await waitFor(() => expect(pathname()).toBe('/'))
  })

  it('redireciona para / ao navegar para /admin/usuarios/novo autenticado como PROFESSOR', async () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, criarTokenFake({ sub: 2, tipo: 2 }))

    const pathname = renderizarRota(['/admin/usuarios/novo'])

    await waitFor(() => expect(pathname()).toBe('/'))
  })

  it('permite acesso a /posts/novo para usuário PROFESSOR autenticado', () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, criarTokenFake({ sub: 2, tipo: 2 }))

    const pathname = renderizarRota(['/posts/novo'])

    expect(pathname()).toBe('/posts/novo')
  })

  it('permite acesso a /admin para usuário ADMINISTRADOR autenticado', async () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, criarTokenFake({ sub: 1, tipo: 1 }))

    const pathname = renderizarRota(['/admin'])

    expect(pathname()).toBe('/admin')
    await waitFor(() => expect(listPosts).toHaveBeenCalled())
  })

  it('permite acesso a /admin/usuarios/novo para usuário ADMINISTRADOR autenticado', () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, criarTokenFake({ sub: 1, tipo: 1 }))

    const pathname = renderizarRota(['/admin/usuarios/novo'])

    expect(pathname()).toBe('/admin/usuarios/novo')
  })

  it('permite acesso público a /, /login e /posts/:id sem autenticação', async () => {
    const pathnameInicial = renderizarRota(['/'])
    expect(pathnameInicial()).toBe('/')
    await waitFor(() => expect(listPosts).toHaveBeenCalled())

    expect(renderizarRota(['/login'])()).toBe('/login')

    const pathname = renderizarRota(['/posts/42'])
    expect(pathname()).toBe('/posts/42')
    expect(await screen.findByText(postMock.titulo)).toBeInTheDocument()
  })

  it('renderiza a página não encontrada (not-found-page) para uma rota inexistente', () => {
    const pathname = renderizarRota(['/rota-que-nao-existe'])

    expect(pathname()).toBe('/rota-que-nao-existe')
    expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument()
  })
})
