import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../../auth/context/auth-context'
import type { Comentario } from '../../../types/comentario'
import { CommentList } from './comment-list'

function criarComentario(overrides: Partial<Comentario> = {}): Comentario {
  return {
    id: '1',
    conteudo: 'Ótimo post!',
    criadoEm: new Date().toISOString(),
    usuario: { id: 1, nome: 'Maria', email: 'maria@escola.com', tipo: 'ALUNO' },
    ...overrides,
  }
}

vi.mock('../../auth/context/auth-context', () => ({
  useAuth: vi.fn(),
}))

function logarComo(usuario: { id: number; tipo: 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO' } | null) {
  vi.mocked(useAuth).mockReturnValue({
    usuario,
    token: usuario ? 'token' : null,
    signIn: vi.fn(),
    signOut: vi.fn(),
  })
}

describe('CommentList', () => {
  afterEach(() => {
    vi.mocked(useAuth).mockReset()
  })

  it('renderiza os comentários recebidos', () => {
    logarComo(null)
    render(<CommentList comentarios={[criarComentario()]} />)

    expect(screen.getByText('Ótimo post!')).toBeInTheDocument()
    expect(screen.getByText('Maria')).toBeInTheDocument()
  })

  it('exibe mensagem quando não há comentários', () => {
    logarComo(null)
    render(<CommentList comentarios={[]} />)

    expect(screen.getByText(/nenhum comentário/i)).toBeInTheDocument()
  })

  it('mostra Excluir ao autor do comentário e chama onExcluir', async () => {
    logarComo({ id: 1, tipo: 'ALUNO' })
    const onExcluir = vi.fn().mockResolvedValue(undefined)
    render(<CommentList comentarios={[criarComentario()]} onExcluir={onExcluir} />)

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(onExcluir).toHaveBeenCalledWith('1'))
  })

  it('mostra Excluir a Professor e Administrador em comentários de terceiros', () => {
    logarComo({ id: 99, tipo: 'PROFESSOR' })
    const { unmount } = render(<CommentList comentarios={[criarComentario()]} onExcluir={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
    unmount()

    logarComo({ id: 98, tipo: 'ADMINISTRADOR' })
    render(<CommentList comentarios={[criarComentario()]} onExcluir={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
  })

  it('não mostra Excluir a Aluno em comentário de outro nem a visitante', () => {
    logarComo({ id: 99, tipo: 'ALUNO' })
    const { unmount } = render(<CommentList comentarios={[criarComentario()]} onExcluir={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument()
    unmount()

    logarComo(null)
    render(<CommentList comentarios={[criarComentario()]} onExcluir={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument()
  })
})
