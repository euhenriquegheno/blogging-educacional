import { z } from 'zod'
import { TipoUsuario } from '../entities/models/tipo-usuario.enum'

const tipoUsuarioZodSchema = z.nativeEnum(TipoUsuario)
// `.options` inclui o reverse-mapping de enums numéricos (ex.: 'ADMINISTRADOR'),
// então filtramos para manter apenas os valores numéricos válidos do enum.
const tipoUsuarioValores = tipoUsuarioZodSchema.options.filter(
  (valor): valor is TipoUsuario => typeof valor === 'number',
)

export const usuarioSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    email: { type: 'string' },
    nome: { type: 'string' },
    cpf: { type: 'string' },
    tipo: { type: 'number', enum: tipoUsuarioValores },
  },
}

export const publicacaoSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'UUID da postagem' },
    titulo: { type: 'string' },
    conteudo: { type: 'string' },
    usuario: usuarioSchema,
  },
}

export const publicacaoBodySchema = {
  type: 'object',
  required: ['titulo', 'conteudo'],
  properties: {
    titulo: { type: 'string' },
    conteudo: { type: 'string' },
  },
}

export const loginBodySchema = {
  type: 'object',
  required: ['email', 'senha'],
  properties: {
    email: { type: 'string' },
    senha: { type: 'string', format: 'password' },
  },
}

export const loginResponseSchema = {
  type: 'object',
  properties: {
    token: { type: 'string' },
  },
}

export const comentarioBodySchema = {
  type: 'object',
  required: ['conteudo'],
  properties: {
    conteudo: { type: 'string', minLength: 1 },
  },
}

export const comentarioSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'UUID do comentário' },
    conteudo: { type: 'string' },
    criadoEm: { type: 'string', format: 'date-time' },
    usuario: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        nome: { type: 'string' },
        email: { type: 'string' },
      },
    },
    publicacao: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
  },
}

export const usuarioBodySchema = {
  type: 'object',
  required: ['email', 'senha', 'nome', 'cpf', 'tipo'],
  properties: {
    email: { type: 'string' },
    senha: { type: 'string', format: 'password' },
    nome: { type: 'string' },
    cpf: { type: 'string' },
    tipo: {
      type: 'number',
      enum: tipoUsuarioValores,
      description: 'Tipo do usuário (1=Administrador, 2=Professor, 3=Aluno)',
    },
  },
}
