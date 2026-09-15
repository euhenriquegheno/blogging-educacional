import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { criarTokenFake } from '../test/jwt'
import { AuthProvider } from '../features/auth/context/auth-context'
import MainLayout from './main-layout'

const TOKEN_STORAGE_KEY = 'blogging-educacional:token'

function renderizarLayout() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<p>Conteúdo da página</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('MainLayout', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renderiza o conteúdo da rota filha via Outlet', () => {
    renderizarLayout()

    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument()
  })

  it('exibe o link "Entrar" e não exibe "Sair" quando não há usuário autenticado', () => {
    renderizarLayout()

    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
  })

  it('não renderiza "Novo post" nem "Administração" para um usuário ALUNO autenticado', () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, criarTokenFake({ sub: 1, tipo: 3 }))

    renderizarLayout()

    expect(screen.queryByRole('link', { name: 'Novo post' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Administração' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('renderiza "Novo post" e "Administração" para um usuário ADMINISTRADOR autenticado', () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, criarTokenFake({ sub: 2, tipo: 1 }))

    renderizarLayout()

    expect(screen.getByRole('link', { name: 'Novo post' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Administração' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('renderiza "Novo post" mas não "Administração" para um usuário PROFESSOR autenticado', () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, criarTokenFake({ sub: 3, tipo: 2 }))

    renderizarLayout()

    expect(screen.getByRole('link', { name: 'Novo post' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Administração' })).not.toBeInTheDocument()
  })

  it('abre e fecha o menu mobile ao clicar no botão de toggle', () => {
    renderizarLayout()

    const botaoToggle = screen.getByRole('button', { name: /menu/i })
    expect(screen.queryByTestId('menu-mobile')).not.toBeInTheDocument()

    fireEvent.click(botaoToggle)
    expect(screen.getByTestId('menu-mobile')).toBeInTheDocument()

    fireEvent.click(botaoToggle)
    expect(screen.queryByTestId('menu-mobile')).not.toBeInTheDocument()
  })
})
