import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { deleteUsuario, listUsuarios } from '../features/auth/api/usuario-api'
import type { Usuario } from '../types/usuario'
import AdminUsuariosPage from './admin-usuarios-page'

vi.mock('../features/auth/api/usuario-api', () => ({
  listUsuarios: vi.fn(),
  deleteUsuario: vi.fn(),
}))

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

const usuariosMock: Usuario[] = [
  { id: 1, nome: 'Admin Geral', email: 'admin@escola.com', tipo: 'ADMINISTRADOR' },
  { id: 2, nome: 'Prof. Ana', email: 'ana@escola.com', tipo: 'PROFESSOR' },
]

function renderizarPagina() {
  return render(
    <MemoryRouter>
      <AdminUsuariosPage />
    </MemoryRouter>,
  )
}

describe('AdminUsuariosPage', () => {
  afterEach(() => {
    vi.mocked(listUsuarios).mockReset()
    vi.mocked(deleteUsuario).mockReset()
    navigateMock.mockReset()
    vi.restoreAllMocks()
  })

  it('lista todos os usuários retornados por listUsuarios', async () => {
    vi.mocked(listUsuarios).mockResolvedValue(usuariosMock)

    renderizarPagina()

    expect(await screen.findByText('Admin Geral')).toBeInTheDocument()
    expect(screen.getByText('Prof. Ana')).toBeInTheDocument()
  })

  it('exibe um link para a criação de usuário apontando para /admin/usuarios/novo', async () => {
    vi.mocked(listUsuarios).mockResolvedValue(usuariosMock)

    renderizarPagina()
    await screen.findByText('Admin Geral')

    expect(screen.getByRole('link', { name: /novo usuário/i })).toHaveAttribute(
      'href',
      '/admin/usuarios/novo',
    )
  })

  it('exibe mensagem de erro quando listUsuarios falha', async () => {
    vi.mocked(listUsuarios).mockRejectedValue(new Error('falha'))

    renderizarPagina()

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os usuários')
  })

  it('clicar em Editar navega para /admin/usuarios/:id/editar', async () => {
    vi.mocked(listUsuarios).mockResolvedValue(usuariosMock)

    renderizarPagina()
    await screen.findByText('Admin Geral')

    fireEvent.click(screen.getAllByRole('button', { name: /editar/i })[0])

    expect(navigateMock).toHaveBeenCalledWith('/admin/usuarios/1/editar')
  })

  it('clicar em Excluir e confirmar chama deleteUsuario(id) e remove o usuário da lista exibida', async () => {
    vi.mocked(listUsuarios).mockResolvedValue(usuariosMock)
    vi.mocked(deleteUsuario).mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderizarPagina()
    await screen.findByText('Admin Geral')

    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: /excluir/i })[0])
    })

    await waitFor(() => {
      expect(deleteUsuario).toHaveBeenCalledWith(1)
    })
    expect(screen.queryByText('Admin Geral')).not.toBeInTheDocument()
    expect(screen.getByText('Prof. Ana')).toBeInTheDocument()
  })

  it('clicar em Excluir e cancelar a confirmação não chama deleteUsuario', async () => {
    vi.mocked(listUsuarios).mockResolvedValue(usuariosMock)
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderizarPagina()
    await screen.findByText('Admin Geral')

    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: /excluir/i })[0])
    })

    expect(deleteUsuario).not.toHaveBeenCalled()
    expect(screen.getByText('Admin Geral')).toBeInTheDocument()
  })
})
