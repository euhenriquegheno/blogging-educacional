import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeAuthenticateUseCase } from '../../../uses-cases/factory/make-authenticate-use-case'

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const loginBodySchema = z.object({
    email: z.string(),
    senha: z.string(),
  })

  const { email, senha } = loginBodySchema.parse(request.body)

  const authenticateUseCase = makeAuthenticateUseCase()

  const usuario = await authenticateUseCase.handler(email, senha)

  const token = await reply.jwtSign(
    { sub: usuario.id as number, tipo: usuario.tipo },
    { expiresIn: '24h' },
  )

  return reply.status(200).send({ token })
}
