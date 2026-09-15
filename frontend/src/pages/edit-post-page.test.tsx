import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPost, updatePost } from '../features/posts/api/posts-api'
import type { Publicacao } from '../types/publicacao'
import EditPostPage from './edit-post-page'

vi.mock('../features/posts/api/posts-api', () => ({
  getPost: vi.fn(),
  updatePost: vi.fn(),
}))

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

const postExistente: Publicacao = {
  id: '42',
  titulo: 'Título original',
  conteudo: 'Conteúdo original',
  usuario: { id: 2, nome: 'Professor', email: 'professor@escola.com', tipo: 'PROFESSOR' },
}

function renderizarPagina(id = '42') {
  return render(
    <MemoryRouter initialEntries={[`/posts/${id}/editar`]}>
      <Routes>
        <Route path="/posts/:id/editar" element={<EditPostPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EditPostPage', () => {
  afterEach(() => {
    vi.mocked(getPost).mockReset()
    vi.mocked(updatePost).mockReset()
    navigateMock.mockReset()
  })

  it('carrega e exibe título/conteúdo existentes do post ao montar', async () => {
    vi.mocked(getPost).mockResolvedValue(postExistente)

    renderizarPagina()

    expect(await screen.findByDisplayValue('Título original')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Conteúdo original')).toBeInTheDocument()
    expect(getPost).toHaveBeenCalledWith('42')
  })

  it('submete o formulário editado chamando updatePost com os novos valores', async () => {
    vi.mocked(getPost).mockResolvedValue(postExistente)
    vi.mocked(updatePost).mockResolvedValue({
      ...postExistente,
      titulo: 'Título editado',
      conteudo: 'Conteúdo editado',
    })

    renderizarPagina()

    await screen.findByDisplayValue('Título original')

    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Título editado' } })
    fireEvent.change(screen.getByLabelText(/conteúdo/i), { target: { value: 'Conteúdo editado' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /salvar/i }))
    })

    await waitFor(() => {
      expect(updatePost).toHaveBeenCalledWith('42', {
        titulo: 'Título editado',
        conteudo: 'Conteúdo editado',
      })
    })
    expect(navigateMock).toHaveBeenCalledWith('/posts/42')
  })
})
