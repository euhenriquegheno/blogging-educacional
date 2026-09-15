import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { listPosts, searchPosts } from '../features/posts/api/posts-api'
import type { Publicacao } from '../types/publicacao'
import PostsListPage from './posts-list-page'

vi.mock('../features/posts/api/posts-api', () => ({
  listPosts: vi.fn(),
  searchPosts: vi.fn(),
}))

const usuarioMock = { id: 10, nome: 'Prof. Ana', email: 'ana@escola.com', tipo: 'PROFESSOR' as const }

function criarPublicacao(id: string, titulo: string): Publicacao {
  return { id, titulo, conteudo: 'Conteúdo de teste sobre o assunto do post.', usuario: usuarioMock }
}

function renderizarPagina() {
  return render(
    <MemoryRouter>
      <PostsListPage />
    </MemoryRouter>,
  )
}

describe('PostsListPage', () => {
  afterEach(() => {
    vi.mocked(listPosts).mockReset()
    vi.mocked(searchPosts).mockReset()
  })

  it('digitar um termo na search-bar e submeter chama searchPosts e renderiza os resultados', async () => {
    vi.mocked(listPosts).mockResolvedValue([criarPublicacao('1', 'Post inicial')])
    vi.mocked(searchPosts).mockResolvedValue([criarPublicacao('2', 'Resultado da busca MySQL')])

    renderizarPagina()

    await screen.findByText('Post inicial')

    fireEvent.change(screen.getByPlaceholderText(/buscar posts/i), { target: { value: 'mysql' } })
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }))

    await waitFor(() => {
      expect(searchPosts).toHaveBeenCalledWith('mysql')
    })
    expect(await screen.findByText('Resultado da busca MySQL')).toBeInTheDocument()
    expect(screen.queryByText('Post inicial')).not.toBeInTheDocument()
  })

  it('clicar em "Próxima página" chama listPosts com page + 1', async () => {
    vi.mocked(listPosts).mockResolvedValue(
      Array.from({ length: 10 }, (_, indice) => criarPublicacao(String(indice), `Post ${indice}`)),
    )

    renderizarPagina()

    await waitFor(() => {
      expect(listPosts).toHaveBeenCalledWith(1, 10)
    })

    fireEvent.click(screen.getByRole('button', { name: /próxima página/i }))

    await waitFor(() => {
      expect(listPosts).toHaveBeenCalledWith(2, 10)
    })
  })
})
