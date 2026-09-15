import { Link } from 'react-router-dom'
import type { Publicacao } from '../../../types/publicacao'

interface PostCardProps {
  post: Publicacao
}

const TAMANHO_MAXIMO_RESUMO = 160

function resumoConteudo(conteudo: string): string {
  if (conteudo.length <= TAMANHO_MAXIMO_RESUMO) {
    return conteudo
  }
  return `${conteudo.slice(0, TAMANHO_MAXIMO_RESUMO).trimEnd()}...`
}

/**
 * Cartão de post exibido na listagem: título (link para o detalhe), autor e
 * um resumo do conteúdo.
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        <Link to={`/posts/${post.id}`} className="hover:underline">
          {post.titulo}
        </Link>
      </h2>
      <p className="mt-1 text-sm text-gray-500">Por {post.usuario.nome}</p>
      <p className="mt-2 text-gray-700">{resumoConteudo(post.conteudo)}</p>
      <Link
        to={`/posts/${post.id}`}
        className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
      >
        Ler mais
      </Link>
    </article>
  )
}
