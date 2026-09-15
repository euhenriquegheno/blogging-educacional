import { FastifyInstance } from 'fastify'
import { create } from './create'
import { findPublicacao } from './find'
import { findAllPublicacao } from './find-all'
import { deletePublicacao } from './delete'
import { update } from './update'
import { searchPublicacoes } from './search'
import { publicacaoBodySchema, publicacaoSchema } from '../../swagger-schemas'
import { verifyJwt } from '../../middlewares/verify-jwt'
import { verifyUserType } from '../../middlewares/verify-user-type'
import { TipoUsuario } from '../../../entities/models/tipo-usuario.enum'

const somenteProfessorOuAdministrador = [
  verifyJwt,
  verifyUserType([TipoUsuario.PROFESSOR, TipoUsuario.ADMINISTRADOR]),
]

export async function publicacaoRoutes(app: FastifyInstance) {
  app.get('/posts/search', {
    schema: {
      tags: ['Posts'],
      summary: 'Busca postagens por título ou conteúdo',
      querystring: {
        type: 'object',
        required: ['q'],
        properties: { q: { type: 'string' } },
      },
      response: { 200: { type: 'array', items: publicacaoSchema } },
    },
  }, searchPublicacoes)

  app.get('/posts', {
    schema: {
      tags: ['Posts'],
      summary: 'Lista postagens',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 10 },
        },
      },
      response: { 200: { type: 'array', items: publicacaoSchema } },
    },
  }, findAllPublicacao)

  app.get('/posts/:id', {
    schema: {
      tags: ['Posts'],
      summary: 'Obtém uma postagem pelo ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      response: { 200: publicacaoSchema },
    },
  }, findPublicacao)

  app.post('/posts', {
    preHandler: somenteProfessorOuAdministrador,
    schema: {
      tags: ['Posts'],
      summary: 'Cria uma postagem',
      body: publicacaoBodySchema,
      response: { 201: publicacaoSchema },
    },
  }, create)

  app.put('/posts/:id', {
    preHandler: somenteProfessorOuAdministrador,
    schema: {
      tags: ['Posts'],
      summary: 'Edita uma postagem',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: publicacaoBodySchema,
      response: { 200: publicacaoSchema },
    },
  }, update)

  app.delete('/posts/:id', {
    preHandler: somenteProfessorOuAdministrador,
    schema: {
      tags: ['Posts'],
      summary: 'Exclui uma postagem',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      response: { 204: { type: 'null' } },
    },
  }, deletePublicacao)
}
