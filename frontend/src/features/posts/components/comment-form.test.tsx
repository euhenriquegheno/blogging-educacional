import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createComentario } from '../api/comentarios-api'
import { useAuth } from '../../auth/context/auth-context'
import { CommentForm } from './comment-form'

vi.mock('../api/comentarios-api', () => ({
  createComentario: vi.fn(),
}))

vi.mock('../../auth/context/auth-context', () => ({
  useAuth: vi.fn(),
}))

describe('CommentForm', () => {
  afterEach(() => {
    vi.mocked(createComentario).mockReset()
    vi.mocked(useAuth).mockReset()
  })

  it('não renderiza nada quando não há usuário autenticado', () => {
    vi.mocked(useAuth).mockReturnValue({
      usuario: null,
      token: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    const { container } = render(<CommentForm publicacaoId="post-1" onComentarioCriado={vi.fn()} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('submete o comentário e chama onComentarioCriado com o resultado', async () => {
    vi.mocked(useAuth).mockReturnValue({
      usuario: { id: 1, tipo: 'ALUNO' },
      token: 'token',
      signIn: vi.fn(),
      signOut: vi.fn(),
    })
    const comentarioCriado = {
      id: '2',
      conteudo: 'Muito bom!',
      criadoEm: new Date().toISOString(),
      usuario: { id: 1, nome: 'Ana', email: 'ana@escola.com', tipo: 'ALUNO' as const },
    }
    vi.mocked(createComentario).mockResolvedValue(comentarioCriado)
    const onComentarioCriado = vi.fn()

    render(<CommentForm publicacaoId="post-1" onComentarioCriado={onComentarioCriado} />)

    fireEvent.change(screen.getByLabelText(/comentário/i), { target: { value: 'Muito bom!' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /comentar/i }))
    })

    await waitFor(() => {
      expect(createComentario).toHaveBeenCalledWith('post-1', 'Muito bom!')
    })
    expect(onComentarioCriado).toHaveBeenCalledWith(comentarioCriado)
  })
})
