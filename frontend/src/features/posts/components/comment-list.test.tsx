import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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

describe('CommentList', () => {
  it('renderiza os comentários recebidos', () => {
    render(<CommentList comentarios={[criarComentario()]} />)

    expect(screen.getByText('Ótimo post!')).toBeInTheDocument()
    expect(screen.getByText('Maria')).toBeInTheDocument()
  })

  it('exibe mensagem quando não há comentários', () => {
    render(<CommentList comentarios={[]} />)

    expect(screen.getByText(/nenhum comentário/i)).toBeInTheDocument()
  })
})
