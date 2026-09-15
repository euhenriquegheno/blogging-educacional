import { apiClient } from '../../../services/api-client'
import type { Usuario } from '../../../types/usuario'

export interface CreateUsuarioInput {
  nome: string
  email: string
  senha: string
  cpf: string
  tipo: Usuario['tipo']
}

/**
 * Mapeia o `tipo` de usuário (string, usado na UI) para o valor numérico
 * esperado pelo backend (`TipoUsuario` em
 * `backend/src/entities/models/tipo-usuario.enum.ts`: ADMINISTRADOR = 1,
 * PROFESSOR = 2, ALUNO = 3). Mantido centralizado aqui para não duplicar o
 * mapeamento em outros pontos do frontend.
 */
export const TIPO_USUARIO_PARA_NUMERO: Record<Usuario['tipo'], number> = {
  ADMINISTRADOR: 1,
  PROFESSOR: 2,
  ALUNO: 3,
}

/** Mapeamento inverso de `TIPO_USUARIO_PARA_NUMERO`, usado ao ler respostas do backend. */
export const TIPO_USUARIO_POR_NUMERO: Record<number, Usuario['tipo']> = {
  1: 'ADMINISTRADOR',
  2: 'PROFESSOR',
  3: 'ALUNO',
}

export interface UsuarioComCpf extends Usuario {
  cpf: string
}

interface UsuarioApiResponse {
  id: number
  nome: string
  email: string
  cpf: string
  tipo: number
}

function mapUsuarioResponse(usuario: UsuarioApiResponse): UsuarioComCpf {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cpf: usuario.cpf,
    tipo: TIPO_USUARIO_POR_NUMERO[usuario.tipo],
  }
}

/**
 * Cria uma conta de usuário. Rota restrita a Administradores (`POST /user`).
 * Converte `tipo` para o valor numérico esperado pelo backend antes de
 * enviar a requisição.
 */
export async function createUsuario(input: CreateUsuarioInput): Promise<Usuario> {
  const { nome, email, senha, cpf, tipo } = input

  return apiClient<Usuario>('/user', {
    method: 'POST',
    body: JSON.stringify({
      nome,
      email,
      senha,
      cpf,
      tipo: TIPO_USUARIO_PARA_NUMERO[tipo],
    }),
  })
}

/**
 * Lista usuários cadastrados. Rota restrita a Administradores (`GET /user`).
 * Converte o `tipo` numérico retornado pelo backend para o valor de domínio
 * usado na UI.
 */
export async function listUsuarios(page: number, limit: number): Promise<Usuario[]> {
  const usuarios = await apiClient<UsuarioApiResponse[]>(`/user?page=${page}&limit=${limit}`)
  return usuarios.map(mapUsuarioResponse)
}

/**
 * Obtém um usuário pelo ID, incluindo o `cpf` (necessário para pré-preencher
 * o formulário de edição). Rota restrita a Administradores (`GET /user/:id`).
 */
export async function getUsuario(id: number): Promise<UsuarioComCpf> {
  const usuario = await apiClient<UsuarioApiResponse>(`/user/${id}`)
  return mapUsuarioResponse(usuario)
}

export type UpdateUsuarioInput = Omit<CreateUsuarioInput, 'senha'>

/**
 * Edita um usuário existente (nome, e-mail, CPF e tipo). Rota restrita a
 * Administradores (`PUT /user/:id`). Não altera a senha — o backend mantém a
 * senha atual quando ela não é enviada no corpo da requisição.
 */
export async function updateUsuario(id: number, input: UpdateUsuarioInput): Promise<Usuario> {
  const { nome, email, cpf, tipo } = input

  return apiClient<Usuario>(`/user/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      nome,
      email,
      cpf,
      tipo: TIPO_USUARIO_PARA_NUMERO[tipo],
    }),
  })
}

/**
 * Exclui um usuário. Rota restrita a Administradores (`DELETE /user/:id`).
 */
export async function deleteUsuario(id: number): Promise<void> {
  await apiClient<void>(`/user/${id}`, {
    method: 'DELETE',
  })
}
