import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPost } from '../features/posts/api/posts-api'

/**
 * Página de criação de post: formulário controlado de `titulo`/`conteudo`
 * (textarea simples, sem editor de texto rico). O autor é sempre o usuário
 * logado — o backend infere isso a partir do token, então o corpo enviado a
 * `createPost` contém apenas `{ titulo, conteudo }`. Ao criar com sucesso,
 * navega para a página do post recém-criado.
 */
export default function CreatePostPage() {
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro(null)

    if (!titulo.trim()) {
      setErro('O título é obrigatório')
      return
    }

    setCarregando(true)
    try {
      const post = await createPost({ titulo, conteudo })
      navigate(`/posts/${post.id}`)
    } catch {
      setErro('Não foi possível criar o post. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 rounded-lg bg-white p-8 shadow"
      >
        <h1 className="text-xl font-semibold text-gray-900">Novo post</h1>

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
          disabled={carregando}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {carregando ? 'Publicando...' : 'Publicar'}
        </button>
      </form>
    </div>
  )
}
