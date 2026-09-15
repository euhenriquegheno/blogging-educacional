import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { Usuario } from '../../../types/usuario'
import { useAuth } from '../context/auth-context'

interface ProtectedRouteProps {
  children: ReactNode
  tiposPermitidos?: Usuario['tipo'][]
}

/**
 * Guarda de rota: redireciona visitantes não autenticados para `/login` e,
 * quando `tiposPermitidos` é informado, redireciona para `/` usuários cujo
 * `tipo` não esteja na lista permitida.
 */
export function ProtectedRoute({ children, tiposPermitidos }: ProtectedRouteProps) {
  const { usuario } = useAuth()
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (tiposPermitidos && !tiposPermitidos.includes(usuario.tipo)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
