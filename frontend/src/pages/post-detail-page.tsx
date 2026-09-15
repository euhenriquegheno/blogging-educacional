import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CommentForm } from '../features/posts/components/comment-form'
import { CommentList } from '../features/posts/components/comment-list'
import { listComentarios } from '../features/posts/api/comentarios-api'
import { getPost } from '../features/posts/api/posts-api'
import type { Comentario } from '../types/comentario'
import type { Publicacao } from '../types/publicacao'

/**
 * Página de leitura de um post: carrega o post e seus comentários via
 * `getPost`/`listComentarios` (ambos públicos) e exibe o formulário de novo
 * comentário apenas para usuários autenticados (delegado ao `CommentForm`).
 */
export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Publicacao | null>(null)
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let ativo = true
    setCarregando(true)
    setErro(null)

    Promise.all([getPost(id), listComentarios(id, 1, 20)])
      .then(([postCarregado, comentariosCarregados]) => {
        if (!ativo) return
        setPost(postCarregado)
        setComentarios(comentariosCarregados)
      })
      .catch(() => {
        if (!ativo) return
        setErro('Não foi possível carregar o post')
      })
      .finally(() => {
        if (!ativo) return
        setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [id])

  function handleComentarioCriado(novoComentario: Comentario) {
    setComentarios((atual) => [...atual, novoComentario])
  }

  if (carregando) {
    return <p className="p-6 text-sm text-gray-500">Carregando...</p>
  }

  if (erro || !post) {
    return <p className="p-6 text-sm text-red-600">{erro ?? 'Post não encontrado'}</p>
  }

  return (
    <article className="mx-auto max-w-2xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">{post.titulo}</h1>
        <p className="text-sm text-gray-500">por {post.usuario.nome}</p>
      </header>

      <p className="whitespace-pre-line text-gray-800">{post.conteudo}</p>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Comentários</h2>
        <CommentList comentarios={comentarios} />
        <CommentForm publicacaoId={id ?? ''} onComentarioCriado={handleComentarioCriado} />
      </section>
    </article>
  )
}
