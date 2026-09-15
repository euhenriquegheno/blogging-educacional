import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Comentario } from '../../../types/comentario'
import { useAuth } from '../../auth/context/auth-context'
import { createComentario } from '../api/comentarios-api'

interface CommentFormProps {
  publicacaoId: string
  onComentarioCriado: (comentario: Comentario) => void
}

/**
 * Formulário de novo comentário. Visível apenas quando há um usuário
 * autenticado (`useAuth().usuario`); visitantes não autenticados não veem
 * nenhum elemento deste componente.
 */
export function CommentForm({ publicacaoId, onComentarioCriado }: CommentFormProps) {
  const { usuario } = useAuth()
  const [conteudo, setConteudo] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (!usuario) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro(null)

    if (!conteudo.trim()) {
      setErro('Escreva um comentário antes de enviar')
      return
    }

    setEnviando(true)
    try {
      const comentario = await createComentario(publicacaoId, conteudo)
      onComentarioCriado(comentario)
      setConteudo('')
    } catch {
      setErro('Não foi possível enviar o comentário')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="comentario" className="block text-sm font-medium text-gray-700">
        Deixe um comentário
      </label>
      <textarea
        id="comentario"
        name="comentario"
        rows={3}
        value={conteudo}
        onChange={(event) => setConteudo(event.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
      />

      {erro && (
        <p role="alert" className="text-sm text-red-600">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {enviando ? 'Enviando...' : 'Comentar'}
      </button>
    </form>
  )
}
