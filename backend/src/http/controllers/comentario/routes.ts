import { FastifyInstance } from 'fastify'
import { create } from './create'
import { findAllComentario } from './find-all'
import { deleteComentario } from './delete'
import { verifyJwt } from '../../middlewares/verify-jwt'
import {
  comentarioBodySchema,
  comentarioSchema,
} from '../../swagger-schemas'

export async function comentarioRoutes(app: FastifyInstance) {
  app.post('/posts/:id/comments', {
    preHandler: [verifyJwt],
    schema: {
      tags: ['Comentários'],
      summary: 'Cria um comentário em uma postagem',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: comentarioBodySchema,
      response: { 201: comentarioSchema },
    },
  }, create)

  app.get('/posts/:id/comments', {
    schema: {
      tags: ['Comentários'],
      summary: 'Lista os comentários de uma postagem',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 10 },
        },
      },
      response: { 200: { type: 'array', items: comentarioSchema } },
    },
  }, findAllComentario)

  app.delete('/comments/:id', {
    preHandler: [verifyJwt],
    schema: {
      tags: ['Comentários'],
      summary:
        'Exclui um comentário (autor do comentário, Professor ou Administrador)',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      response: { 204: { type: 'null' } },
    },
  }, deleteComentario)
}
