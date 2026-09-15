import { useEffect, useState } from 'react'
import { Pagination } from '../components/pagination'
import { PostCard } from '../features/posts/components/post-card'
import { SearchBar } from '../features/posts/components/search-bar'
import { listPosts, searchPosts } from '../features/posts/api/posts-api'
import type { Publicacao } from '../types/publicacao'

const POSTS_POR_PAGINA = 10

/**
 * Listagem pública de posts: busca paginada via `listPosts` por padrão e,
 * quando há um termo de busca ativo, troca para os resultados de
 * `searchPosts` (sem paginação, já que a API de busca não a suporta).
 */
export default function PostsListPage() {
  const [posts, setPosts] = useState<Publicacao[]>([])
  const [page, setPage] = useState(1)
  const [termoBusca, setTermoBusca] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (termoBusca !== null) {
      return
    }

    let ativo = true
    setCarregando(true)
    setErro(null)

    listPosts(page, POSTS_POR_PAGINA)
      .then((resultado) => {
        if (ativo) setPosts(resultado)
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar os posts.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [page, termoBusca])

  async function handleSearch(termo: string) {
    if (!termo) {
      setTermoBusca(null)
      setPage(1)
      return
    }

    setTermoBusca(termo)
    setCarregando(true)
    setErro(null)

    try {
      const resultado = await searchPosts(termo)
      setPosts(resultado)
    } catch {
      setErro('Não foi possível buscar os posts.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Posts</h1>

      <div className="mt-4">
        <SearchBar onSearch={handleSearch} />
      </div>

      {erro && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="mt-6 text-gray-500">Carregando...</p>
      ) : posts.length === 0 ? (
        <p className="mt-6 text-gray-500">Nenhum post encontrado.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {termoBusca === null && (
        <Pagination
          page={page}
          hasNextPage={posts.length === POSTS_POR_PAGINA}
          onPreviousPage={() => setPage((atual) => Math.max(1, atual - 1))}
          onNextPage={() => setPage((atual) => atual + 1)}
        />
      )}
    </div>
  )
}
