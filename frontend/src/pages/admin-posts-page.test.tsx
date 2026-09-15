import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { deletePost, listPosts } from '../features/posts/api/posts-api'
import type { Publicacao } from '../types/publicacao'
import AdminPostsPage from './admin-posts-page'

vi.mock('../features/posts/api/posts-api', () => ({
  listPosts: vi.fn(),
  deletePost: vi.fn(),
}))

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

const postsMock: Publicacao[] = [
  {
    id: '1',
    titulo: 'Aprendendo MySQL',
    conteudo: 'Conteúdo sobre MySQL',
    usuario: { id: 10, nome: 'Prof. Ana', email: 'ana@escola.com', tipo: 'PROFESSOR' },
  },
  {
    id: '2',
    titulo: 'Introdução ao React',
    conteudo: 'Conteúdo sobre React',
    usuario: { id: 11, nome: 'Prof. Beto', email: 'beto@escola.com', tipo: 'PROFESSOR' },
  },
]

function renderizarPagina() {
  return render(
    <MemoryRouter>
      <AdminPostsPage />
    </MemoryRouter>,
  )
}

describe('AdminPostsPage', () => {
  afterEach(() => {
    vi.mocked(listPosts).mockReset()
    vi.mocked(deletePost).mockReset()
    navigateMock.mockReset()
    vi.restoreAllMocks()
  })

  it('lista todos os posts retornados por listPosts', async () => {
    vi.mocked(listPosts).mockResolvedValue(postsMock)

    renderizarPagina()

    expect(await screen.findByText('Aprendendo MySQL')).toBeInTheDocument()
    expect(screen.getByText('Introdução ao React')).toBeInTheDocument()
  })

  it('exibe um link "Novo post" apontando para /posts/novo', async () => {
    vi.mocked(listPosts).mockResolvedValue(postsMock)

    renderizarPagina()
    await screen.findByText('Aprendendo MySQL')

    expect(screen.getByRole('link', { name: /novo post/i })).toHaveAttribute('href', '/posts/novo')
  })

  it('clicar em Editar navega para /posts/:id/editar', async () => {
    vi.mocked(listPosts).mockResolvedValue(postsMock)

    renderizarPagina()
    await screen.findByText('Aprendendo MySQL')

    fireEvent.click(screen.getAllByRole('button', { name: /editar/i })[0])

    expect(navigateMock).toHaveBeenCalledWith('/posts/1/editar')
  })

  it('clicar em Excluir e confirmar chama deletePost(id) e remove o post da lista exibida', async () => {
    vi.mocked(listPosts).mockResolvedValue(postsMock)
    vi.mocked(deletePost).mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderizarPagina()
    await screen.findByText('Aprendendo MySQL')

    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: /excluir/i })[0])
    })

    await waitFor(() => {
      expect(deletePost).toHaveBeenCalledWith('1')
    })
    expect(screen.queryByText('Aprendendo MySQL')).not.toBeInTheDocument()
    expect(screen.getByText('Introdução ao React')).toBeInTheDocument()
  })

  it('clicar em Excluir e cancelar a confirmação não chama deletePost', async () => {
    vi.mocked(listPosts).mockResolvedValue(postsMock)
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderizarPagina()
    await screen.findByText('Aprendendo MySQL')

    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: /excluir/i })[0])
    })

    expect(deletePost).not.toHaveBeenCalled()
    expect(screen.getByText('Aprendendo MySQL')).toBeInTheDocument()
  })
})
