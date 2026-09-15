import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deletePost, listPosts } from '../features/posts/api/posts-api'
import type { Publicacao } from '../types/publicacao'

/**
 * Página administrativa de posts: lista todos os posts e permite ao
 * Administrador editar (navegando para o formulário de edição) ou excluir
 * (mediante confirmação) qualquer post, independentemente do autor.
 */
export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Publicacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    let ativo = true

    async function carregarPosts() {
      setCarregando(true)
      setErro(null)
      try {
        const resultado = await listPosts(1, 100)
        if (ativo) {
          setPosts(resultado)
        }
      } catch {
        if (ativo) {
          setErro('Não foi possível carregar os posts')
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarPosts()

    return () => {
      ativo = false
    }
  }, [])

  function handleEditar(id: string) {
    navigate(`/posts/${id}/editar`)
  }

  async function handleExcluir(id: string) {
    const confirmado = window.confirm('Tem certeza que deseja excluir este post?')
    if (!confirmado) {
      return
    }

    try {
      await deletePost(id)
      setPosts((atuais) => atuais.filter((post) => post.id !== id))
    } catch {
      setErro('Não foi possível excluir o post')
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Link
          to="/posts/novo"
          className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
        >
          Novo post
        </Link>
      </div>

      {erro && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {erro}
        </p>
      )}

      {carregando ? (
        <p>Carregando posts...</p>
      ) : posts.length === 0 ? (
        <p>Nenhum post encontrado.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-medium text-gray-900">{post.titulo}</p>
                <p className="text-sm text-gray-500">{post.usuario.nome}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditar(post.id)}
                  className="rounded border border-blue-600 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleExcluir(post.id)}
                  className="rounded border border-red-600 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
