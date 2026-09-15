import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createUsuario } from '../features/auth/api/usuario-api'
import AdminCreateUsuarioPage from './admin-create-usuario-page'

vi.mock('../features/auth/api/usuario-api', () => ({
  createUsuario: vi.fn(),
}))

function renderizarPagina() {
  return render(<AdminCreateUsuarioPage />)
}

async function preencherEEnviarFormulario({
  nome = 'Maria Professora',
  email = 'maria@escola.com',
  senha = 'senha123',
  cpf = '12345678900',
  tipo = 'PROFESSOR',
} = {}) {
  fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: nome } })
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: email } })
  fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: senha } })
  fireEvent.change(screen.getByLabelText(/cpf/i), { target: { value: cpf } })
  fireEvent.change(screen.getByLabelText(/tipo/i), { target: { value: tipo } })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))
  })
}

describe('AdminCreateUsuarioPage', () => {
  afterEach(() => {
    vi.mocked(createUsuario).mockReset()
  })

  it('submete o formulário preenchido, chama createUsuario com o tipo selecionado e exibe mensagem de sucesso', async () => {
    vi.mocked(createUsuario).mockResolvedValue({
      id: 1,
      nome: 'Maria Professora',
      email: 'maria@escola.com',
      tipo: 'PROFESSOR',
    })

    renderizarPagina()
    await preencherEEnviarFormulario({ tipo: 'PROFESSOR' })

    expect(createUsuario).toHaveBeenCalledWith({
      nome: 'Maria Professora',
      email: 'maria@escola.com',
      senha: 'senha123',
      cpf: '12345678900',
      tipo: 'PROFESSOR',
    })
    expect(await screen.findByText(/conta criada com sucesso/i)).toBeInTheDocument()
  })

  it('submete o formulário com e-mail em formato inválido, exibe erro de validação e não chama createUsuario', async () => {
    renderizarPagina()
    await preencherEEnviarFormulario({ email: 'email-invalido' })

    expect(await screen.findByRole('alert')).toHaveTextContent(/e-mail/i)
    expect(createUsuario).not.toHaveBeenCalled()
  })
})
