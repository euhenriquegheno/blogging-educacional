import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getUsuario, updateUsuario } from '../features/auth/api/usuario-api'
import type { UsuarioComCpf } from '../features/auth/api/usuario-api'
import EditUsuarioPage from './edit-usuario-page'

vi.mock('../features/auth/api/usuario-api', () => ({
  getUsuario: vi.fn(),
  updateUsuario: vi.fn(),
}))

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

const usuarioExistente: UsuarioComCpf = {
  id: 2,
  nome: 'Maria Professora',
  email: 'maria@escola.com',
  cpf: '22222222222',
  tipo: 'PROFESSOR',
}

function renderizarPagina(id = '2') {
  return render(
    <MemoryRouter initialEntries={[`/admin/usuarios/${id}/editar`]}>
      <Routes>
        <Route path="/admin/usuarios/:id/editar" element={<EditUsuarioPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EditUsuarioPage', () => {
  afterEach(() => {
    vi.mocked(getUsuario).mockReset()
    vi.mocked(updateUsuario).mockReset()
    navigateMock.mockReset()
  })

  it('carrega e exibe os dados existentes do usuário ao montar', async () => {
    vi.mocked(getUsuario).mockResolvedValue(usuarioExistente)

    renderizarPagina()

    expect(await screen.findByDisplayValue('Maria Professora')).toBeInTheDocument()
    expect(screen.getByDisplayValue('maria@escola.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('22222222222')).toBeInTheDocument()
    expect(getUsuario).toHaveBeenCalledWith(2)
    expect(screen.queryByLabelText(/senha/i)).not.toBeInTheDocument()
  })

  it('submete o formulário editado chamando updateUsuario com os novos valores e navega para a listagem', async () => {
    vi.mocked(getUsuario).mockResolvedValue(usuarioExistente)
    vi.mocked(updateUsuario).mockResolvedValue({
      id: 2,
      nome: 'Maria Silva',
      email: 'maria@escola.com',
      tipo: 'PROFESSOR',
    })

    renderizarPagina()

    await screen.findByDisplayValue('Maria Professora')

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Maria Silva' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /salvar/i }))
    })

    await waitFor(() => {
      expect(updateUsuario).toHaveBeenCalledWith(2, {
        nome: 'Maria Silva',
        email: 'maria@escola.com',
        cpf: '22222222222',
        tipo: 'PROFESSOR',
      })
    })
    expect(navigateMock).toHaveBeenCalledWith('/admin/usuarios')
  })

  it('submete com e-mail em formato inválido, exibe erro de validação e não chama updateUsuario', async () => {
    vi.mocked(getUsuario).mockResolvedValue(usuarioExistente)

    renderizarPagina()
    await screen.findByDisplayValue('Maria Professora')

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'email-invalido' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /salvar/i }))
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(/e-mail/i)
    expect(updateUsuario).not.toHaveBeenCalled()
  })
})
