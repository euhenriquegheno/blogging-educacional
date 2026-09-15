import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { clearStoredToken, getStoredToken, setStoredToken } from '../../../services/api-client'
import type { Usuario } from '../../../types/usuario'

/**
 * Representa o usuário autenticado a partir das informações disponíveis no
 * payload do JWT (`sub`/`tipo`). O token não carrega `nome`/`email`, então
 * este tipo é um subconjunto de `Usuario`.
 */
export interface UsuarioSessao {
  id: number
  tipo: Usuario['tipo']
}

interface AuthContextValue {
  usuario: UsuarioSessao | null
  token: string | null
  signIn: (token: string) => void
  signOut: () => void
}

const TIPO_USUARIO_POR_CODIGO: Record<number, Usuario['tipo']> = {
  1: 'ADMINISTRADOR',
  2: 'PROFESSOR',
  3: 'ALUNO',
}

interface JwtPayload {
  sub: number
  tipo: number
  exp?: number
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddingNecessario = (4 - (base64.length % 4)) % 4
    const base64Preenchido = base64.padEnd(base64.length + paddingNecessario, '=')

    const json = atob(base64Preenchido)
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function usuarioSessaoFromToken(token: string): UsuarioSessao | null {
  const payload = decodeJwtPayload(token)
  if (!payload) return null

  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
    return null
  }

  const tipo = TIPO_USUARIO_POR_CODIGO[payload.tipo]
  if (!tipo) return null

  return { id: payload.sub, tipo }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(() => {
    const storedToken = getStoredToken()
    return storedToken ? usuarioSessaoFromToken(storedToken) : null
  })

  function signIn(novoToken: string) {
    setStoredToken(novoToken)
    setToken(novoToken)
    setUsuario(usuarioSessaoFromToken(novoToken))
  }

  function signOut() {
    clearStoredToken()
    setToken(null)
    setUsuario(null)
  }

  const value: AuthContextValue = { usuario, token, signIn, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
