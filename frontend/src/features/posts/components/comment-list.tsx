import { useState } from 'react'
import type { Comentario } from '../../../types/comentario'
import { useAuth } from '../../auth/context/auth-context'

interface CommentListProps {
  comentarios: Comentario[]
  onExcluir?: (id: string) => Promise<void> | void
}

/**
 * Lista os comentários de um post. Sempre visível, inclusive para
 * visitantes não autenticados (leitura é pública).
 */
export function CommentList({ comentarios, onExcluir }: CommentListProps) {
  const { usuario } = useAuth()
  const [excluindoId, setExcluindoId] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  function podeExcluir(comentario: Comentario) {
    if (!usuario || !onExcluir) return false
    return (
      usuario.tipo === 'ADMINISTRADOR' ||
      usuario.tipo === 'PROFESSOR' ||
      usuario.id === comentario.usuario.id
    )
  }

  async function handleExcluir(id: string) {
    if (!onExcluir) return
    setErro(null)
    setExcluindoId(id)
    try {
      await onExcluir(id)
    } catch {
      setErro('Não foi possível excluir o comentário')
    } finally {
      setExcluindoId(null)
    }
  }

  if (comentarios.length === 0) {
    return <p className="text-sm text-gray-500">Nenhum comentário ainda.</p>
  }

  return (
    <div className="space-y-2">
      {erro && (
        <p role="alert" className="text-sm text-red-600">
          {erro}
        </p>
      )}
      <ul className="space-y-4" aria-label="Lista de comentários">
        {comentarios.map((comentario) => (
          <li key={comentario.id} className="rounded border border-gray-200 p-3">
            <p className="text-sm font-medium text-gray-900">{comentario.usuario.nome}</p>
            <p className="text-sm text-gray-700">{comentario.conteudo}</p>
            {podeExcluir(comentario) && (
              <button
                type="button"
                onClick={() => handleExcluir(comentario.id)}
                disabled={excluindoId === comentario.id}
                className="mt-2 text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                {excluindoId === comentario.id ? 'Excluindo...' : 'Excluir'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
