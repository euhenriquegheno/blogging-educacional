import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/auth-context'

/**
 * Layout compartilhado por todas as rotas da aplicação: cabeçalho com
 * navegação condicional por `tipo` do usuário autenticado (via `useAuth()`)
 * e menu mobile com toggle. Renderiza as rotas filhas via `<Outlet />`.
 */
export default function MainLayout() {
  const { usuario, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  const podeCriarPost = usuario?.tipo === 'PROFESSOR' || usuario?.tipo === 'ADMINISTRADOR'
  const ehAdministrador = usuario?.tipo === 'ADMINISTRADOR'

  function handleSignOut() {
    signOut()
    setMenuAberto(false)
    navigate('/')
  }

  function LinksNavegacao({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <>
        <Link to="/" onClick={onNavigate} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
          Posts
        </Link>

        {podeCriarPost && (
          <Link
            to="/posts/novo"
            onClick={onNavigate}
            className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Novo post
          </Link>
        )}

        {ehAdministrador && (
          <Link
            to="/admin"
            onClick={onNavigate}
            className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Administração
          </Link>
        )}

        {usuario ? (
          <button
            type="button"
            onClick={() => {
              onNavigate?.()
              handleSignOut()
            }}
            className="block px-3 py-2 text-left text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Sair
          </button>
        ) : (
          <Link
            to="/login"
            onClick={onNavigate}
            className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Entrar
          </Link>
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-gray-900">
            API Blogging
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-2">
            <LinksNavegacao />
          </nav>

          <button
            type="button"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            onClick={() => setMenuAberto((atual) => !atual)}
            className="rounded p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          >
            Menu
          </button>
        </div>

        {menuAberto && (
          <nav
            id="menu-mobile"
            data-testid="menu-mobile"
            className="flex flex-col border-t border-gray-200 px-4 py-2 sm:px-6 md:hidden"
          >
            <LinksNavegacao onNavigate={() => setMenuAberto(false)} />
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl">
        <Outlet />
      </main>
    </div>
  )
}
