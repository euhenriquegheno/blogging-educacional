import { createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '../../features/auth/components/protected-route'
import MainLayout from '../../layouts/main-layout'
import AdminLayout from '../../layouts/admin-layout'
import LoginPage from '../../pages/login-page'
import PostsListPage from '../../pages/posts-list-page'
import PostDetailPage from '../../pages/post-detail-page'
import CreatePostPage from '../../pages/create-post-page'
import EditPostPage from '../../pages/edit-post-page'
import AdminPostsPage from '../../pages/admin-posts-page'
import AdminUsuariosPage from '../../pages/admin-usuarios-page'
import AdminCreateUsuarioPage from '../../pages/admin-create-usuario-page'
import EditUsuarioPage from '../../pages/edit-usuario-page'
import NotFoundPage from '../../pages/not-found-page'

/**
 * Definição de rotas da aplicação, separada de `router` para permitir o uso
 * de `createMemoryRouter` nos testes.
 *
 * Todas as rotas são filhas de `MainLayout` (cabeçalho com navegação
 * condicional por sessão/tipo), renderizado via `<Outlet />`. A rota
 * coringa (`*`) captura qualquer caminho não registrado e exibe
 * `NotFoundPage`.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <PostsListPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'posts/:id',
        element: <PostDetailPage />,
      },
      {
        path: 'posts/novo',
        element: (
          <ProtectedRoute tiposPermitidos={['PROFESSOR', 'ADMINISTRADOR']}>
            <CreatePostPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'posts/:id/editar',
        element: (
          <ProtectedRoute tiposPermitidos={['PROFESSOR', 'ADMINISTRADOR']}>
            <EditPostPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute tiposPermitidos={['ADMINISTRADOR']}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminPostsPage />,
          },
          {
            path: 'usuarios',
            element: <AdminUsuariosPage />,
          },
          {
            path: 'usuarios/novo',
            element: <AdminCreateUsuarioPage />,
          },
          {
            path: 'usuarios/:id/editar',
            element: <EditUsuarioPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
