import { FastifyInstance } from 'fastify'
import { login } from './login'
import { loginBodySchema, loginResponseSchema } from '../../swagger-schemas'

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/login',
    {
      schema: {
        tags: ['Autenticação'],
        summary: 'Autentica um usuário e retorna um token JWT',
        body: loginBodySchema,
        response: { 200: loginResponseSchema },
      },
    },
    login,
  )
}
