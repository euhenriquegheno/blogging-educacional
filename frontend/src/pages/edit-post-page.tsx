import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPost, updatePost } from '../features/posts/api/posts-api'

/**
 * Página de edição de post: carrega o post existente via `getPost(id)`,
 * pré-preenche o formulário (textarea simples para `conteudo` — nunca um
 * editor de texto rico) e chama `updatePost` ao submeter.
 */
export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelado = false

    getPost(id)
      .then((post) => {
        if (cancelado) {
          return
        }
        setTitulo(post.titulo)
        setConteudo(post.conteudo)
      })
      .catch(() => {
        if (!cancelado) {
          setErro('Não foi possível carregar o post')
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCarregando(false)
        }
      })

    return () => {
      cancelado = true
    }
  }, [id])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!id) {
      return
    }

    if (!titulo.trim() || !conteudo.trim()) {
      setErro('Preencha título e conteúdo')
      return
    }

    setErro(null)
    setSalvando(true)

    try {
      const post = await updatePost(id, { titulo, conteudo })
      navigate(`/posts/${post.id}`)
    } catch {
      setErro('Não foi possível salvar as alterações')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Editar post</h1>

        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="conteudo" className="block text-sm font-medium text-gray-700">
            Conteúdo
          </label>
          <textarea
            id="conteudo"
            name="conteudo"
            rows={10}
            value={conteudo}
            onChange={(event) => setConteudo(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {erro && (
          <p role="alert" className="text-sm text-red-600">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={salvando}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}
