import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../features/auth/context/auth-context'
import { createComentario, listComentarios } from '../features/posts/api/comentarios-api'
import { getPost } from '../features/posts/api/posts-api'
import PostDetailPage from './post-detail-page'

vi.mock('../features/posts/api/posts-api', () => ({
  getPost: vi.fn(),
}))

vi.mock('../features/posts/api/comentarios-api', () => ({
  listComentarios: vi.fn(),
  createComentario: vi.fn(),
}))

vi.mock('../features/auth/context/auth-context', () => ({
  useAuth: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: 'post-1' }),
  }
})

const postMock = {
  id: 'post-1',
  titulo: 'Introdução ao MySQL',
  conteudo: 'Conteúdo do post...',
  usuario: { id: 2, nome: 'Prof. João', email: 'joao@escola.com', tipo: 'PROFESSOR' as const },
}

const comentarioExistente = {
  id: 'c1',
  conteudo: 'Primeiro comentário',
  criadoEm: new Date().toISOString(),
  usuario: { id: 3, nome: 'Ana', email: 'ana@escola.com', tipo: 'ALUNO' as const },
}

function renderizarPagina() {
  return render(
    <MemoryRouter>
      <PostDetailPage />
    </MemoryRouter>,
  )
}

describe('PostDetailPage', () => {
  afterEach(() => {
    vi.mocked(getPost).mockReset()
    vi.mocked(listComentarios).mockReset()
    vi.mocked(createComentario).mockReset()
    vi.mocked(useAuth).mockReset()
  })

  it('visitante não autenticado vê a lista de comentários mas não o formulário', async () => {
    vi.mocked(useAuth).mockReturnValue({
      usuario: null,
      token: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    })
    vi.mocked(getPost).mockResolvedValue(postMock)
    vi.mocked(listComentarios).mockResolvedValue([comentarioExistente])

    renderizarPagina()

    expect(await screen.findByText('Primeiro comentário')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /comentar/i })).not.toBeInTheDocument()
  })

  it('usuário autenticado submete um comentário e ele aparece na lista', async () => {
    vi.mocked(useAuth).mockReturnValue({
      usuario: { id: 3, tipo: 'ALUNO' },
      token: 'token',
      signIn: vi.fn(),
      signOut: vi.fn(),
    })
    vi.mocked(getPost).mockResolvedValue(postMock)
    vi.mocked(listComentarios).mockResolvedValue([])
    const novoComentario = {
      id: 'c2',
      conteudo: 'Muito útil, obrigado!',
      criadoEm: new Date().toISOString(),
      usuario: { id: 3, nome: 'Ana', email: 'ana@escola.com', tipo: 'ALUNO' as const },
    }
    vi.mocked(createComentario).mockResolvedValue(novoComentario)

    renderizarPagina()

    await screen.findByText(postMock.titulo)

    fireEvent.change(screen.getByLabelText(/comentário/i), {
      target: { value: 'Muito útil, obrigado!' },
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /comentar/i }))
    })

    await waitFor(() => {
      expect(createComentario).toHaveBeenCalledWith('post-1', 'Muito útil, obrigado!')
    })
    expect(await screen.findByText('Muito útil, obrigado!')).toBeInTheDocument()
  })
})
