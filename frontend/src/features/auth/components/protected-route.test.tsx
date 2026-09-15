import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { criarTokenFake } from '../../../test/jwt'
import { AuthProvider } from '../context/auth-context'
import { ProtectedRoute } from './protected-route'

const TOKEN_STORAGE_KEY = 'blogging-educacional:token'

function renderizarComRotas(initialEntries: string[]) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<p>Página de login</p>} />
          <Route path="/" element={<p>Página inicial</p>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute tiposPermitidos={['ADMINISTRADOR']}>
                <p>Área restrita</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('redireciona para /login quando useAuth().usuario é null', () => {
    renderizarComRotas(['/admin'])

    expect(screen.getByText('Página de login')).toBeInTheDocument()
    expect(screen.queryByText('Área restrita')).not.toBeInTheDocument()
  })

  it('renderiza o conteúdo filho quando o usuário está autenticado e seu tipo está em tiposPermitidos', () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, criarTokenFake({ sub: 1, tipo: 1 }))

    renderizarComRotas(['/admin'])

    expect(screen.getByText('Área restrita')).toBeInTheDocument()
  })

  it('redireciona para / quando o tipo do usuário autenticado não está em tiposPermitidos', () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, criarTokenFake({ sub: 2, tipo: 3 }))

    renderizarComRotas(['/admin'])

    expect(screen.getByText('Página inicial')).toBeInTheDocument()
    expect(screen.queryByText('Área restrita')).not.toBeInTheDocument()
  })
})
