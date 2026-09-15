import { Link } from 'react-router-dom'

/**
 * Página exibida para qualquer rota não registrada (`path: '*'` no
 * roteador). Oferece um link de volta para a listagem pública de posts.
 */
export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-gray-900">404 — Página não encontrada</h1>
      <p className="text-gray-600">A página que você tentou acessar não existe ou foi movida.</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Voltar para a página inicial
      </Link>
    </div>
  )
}
