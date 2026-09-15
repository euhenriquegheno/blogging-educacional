import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { login } from '../features/auth/api/auth-api'
import { useAuth } from '../features/auth/context/auth-context'
import LoginPage from './login-page'

vi.mock('../features/auth/api/auth-api', () => ({
  login: vi.fn(),
}))

vi.mock('../features/auth/context/auth-context', () => ({
  useAuth: vi.fn(),
}))

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

function renderizarPagina() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

async function preencherEEnviarFormulario() {
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'professor@escola.com' } })
  fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'senha123' } })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
  })
}

describe('LoginPage', () => {
  afterEach(() => {
    vi.mocked(login).mockReset()
    vi.mocked(useAuth).mockReset()
    navigateMock.mockReset()
  })

  it('submete com credenciais válidas, chama signIn e navega para /', async () => {
    const signInMock = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      usuario: null,
      token: null,
      signIn: signInMock,
      signOut: vi.fn(),
    })
    vi.mocked(login).mockResolvedValue({ token: 'jwt-token-123' })

    renderizarPagina()
    await preencherEEnviarFormulario()

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('jwt-token-123')
    })
    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  it('submete com credenciais inválidas, exibe mensagem de erro e não chama signIn', async () => {
    const signInMock = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      usuario: null,
      token: null,
      signIn: signInMock,
      signOut: vi.fn(),
    })
    vi.mocked(login).mockRejectedValue(new Error('Credenciais inválidas'))

    renderizarPagina()
    await preencherEEnviarFormulario()

    expect(await screen.findByText('E-mail ou senha inválidos')).toBeInTheDocument()
    expect(signInMock).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
