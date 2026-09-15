import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPost } from '../features/posts/api/posts-api'
import CreatePostPage from './create-post-page'

vi.mock('../features/posts/api/posts-api', () => ({
  createPost: vi.fn(),
}))

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

function renderizarPagina() {
  return render(
    <MemoryRouter>
      <CreatePostPage />
    </MemoryRouter>,
  )
}

async function preencherEEnviarFormulario({ titulo = '', conteudo = '' } = {}) {
  if (titulo) {
    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: titulo } })
  }
  if (conteudo) {
    fireEvent.change(screen.getByLabelText(/conteúdo/i), { target: { value: conteudo } })
  }
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /publicar/i }))
  })
}

describe('CreatePostPage', () => {
  afterEach(() => {
    vi.mocked(createPost).mockReset()
    navigateMock.mockReset()
  })

  it('submete com título e conteúdo preenchidos, chama createPost e navega para o post criado', async () => {
    vi.mocked(createPost).mockResolvedValue({
      id: 'post-1',
      titulo: 'Meu Post',
      conteudo: 'Conteúdo do post',
      usuario: { id: 1, nome: 'Professor', email: 'p@escola.com', tipo: 'PROFESSOR' },
    })

    renderizarPagina()
    await preencherEEnviarFormulario({ titulo: 'Meu Post', conteudo: 'Conteúdo do post' })

    expect(createPost).toHaveBeenCalledWith({ titulo: 'Meu Post', conteudo: 'Conteúdo do post' })
    expect(navigateMock).toHaveBeenCalledWith('/posts/post-1')
  })

  it('submete com título vazio, exibe erro de validação e não chama createPost', async () => {
    renderizarPagina()
    await preencherEEnviarFormulario({ titulo: '', conteudo: 'Conteúdo do post' })

    expect(await screen.findByRole('alert')).toHaveTextContent(/título/i)
    expect(createPost).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
