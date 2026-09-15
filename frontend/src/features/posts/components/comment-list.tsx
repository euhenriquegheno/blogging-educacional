import type { Comentario } from '../../../types/comentario'

interface CommentListProps {
  comentarios: Comentario[]
}

/**
 * Lista os comentários de um post. Sempre visível, inclusive para
 * visitantes não autenticados (leitura é pública).
 */
export function CommentList({ comentarios }: CommentListProps) {
  if (comentarios.length === 0) {
    return <p className="text-sm text-gray-500">Nenhum comentário ainda.</p>
  }

  return (
    <ul className="space-y-4" aria-label="Lista de comentários">
      {comentarios.map((comentario) => (
        <li key={comentario.id} className="rounded border border-gray-200 p-3">
          <p className="text-sm font-medium text-gray-900">{comentario.usuario.nome}</p>
          <p className="text-sm text-gray-700">{comentario.conteudo}</p>
        </li>
      ))}
    </ul>
  )
}
