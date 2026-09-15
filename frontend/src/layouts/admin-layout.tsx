import { NavLink, Outlet } from 'react-router-dom'

/**
 * Layout da área administrativa: exibe os menus "Publicações" e "Usuários"
 * e renderiza a página correspondente via `<Outlet />`.
 */
export default function AdminLayout() {
  function classeLink({ isActive }: { isActive: boolean }) {
    return `border-b-2 px-3 py-2 text-sm font-medium ${
      isActive
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Administração</h1>

      <nav className="mb-6 flex gap-2 border-b border-gray-200">
        <NavLink to="/admin" end className={classeLink}>
          Publicações
        </NavLink>
        <NavLink to="/admin/usuarios" className={classeLink}>
          Usuários
        </NavLink>
      </nav>

      <Outlet />
    </div>
  )
}
