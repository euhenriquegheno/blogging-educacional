import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { criarTokenFake } from '../../../test/jwt'
import { AuthProvider, useAuth } from './auth-context'

const TOKEN_STORAGE_KEY = 'blogging-educacional:token'

function ConsumidorDeTeste() {
  const { usuario, token, signIn, signOut } = useAuth()

  return (
    <div>
      <span data-testid="usuario">{usuario ? `${usuario.id}-${usuario.tipo}` : 'nenhum'}</span>
      <span data-testid="token">{token ?? 'nenhum'}</span>
      <button onClick={() => signIn(criarTokenFake({ sub: 7, tipo: 2 }))}>entrar</button>
      <button onClick={signOut}>sair</button>
    </div>
  )
}

describe('AuthProvider / useAuth', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('inicia sem usuário autenticado quando não há token salvo', () => {
    render(
      <AuthProvider>
        <ConsumidorDeTeste />
      </AuthProvider>,
    )

    expect(screen.getByTestId('usuario')).toHaveTextContent('nenhum')
    expect(screen.getByTestId('token')).toHaveTextContent('nenhum')
  })

  it('signIn decodifica o token (sub/tipo) e persiste em localStorage', async () => {
    render(
      <AuthProvider>
        <ConsumidorDeTeste />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText('entrar').click()
    })

    expect(screen.getByTestId('usuario')).toHaveTextContent('7-PROFESSOR')
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).not.toBeNull()
  })

  it('signOut limpa o usuário e o token do localStorage', async () => {
    render(
      <AuthProvider>
        <ConsumidorDeTeste />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText('entrar').click()
    })
    await act(async () => {
      screen.getByText('sair').click()
    })

    expect(screen.getByTestId('usuario')).toHaveTextContent('nenhum')
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('restaura a sessão a partir de um token já salvo em localStorage', () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, criarTokenFake({ sub: 3, tipo: 1 }))

    render(
      <AuthProvider>
        <ConsumidorDeTeste />
      </AuthProvider>,
    )

    expect(screen.getByTestId('usuario')).toHaveTextContent('3-ADMINISTRADOR')
  })
})
