import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../../features/auth/context/auth-context'
import { router } from './router'

/**
 * Componente raiz: disponibiliza a sessão autenticada (`AuthProvider`) para
 * toda a árvore de rotas e delega a navegação ao roteador configurado em
 * `router.tsx` (Fase 9 / Task 14.2).
 */
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
