import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeFindUsuarioUseCase } from '../../../uses-cases/factory/make-find-usuario-use-case'

export async function findUsuario(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerParamsSchema = z.object({
    id: z.coerce.number(),
  })

  const { id } = registerParamsSchema.parse(request.params)
  const findUsuarioUseCase = makeFindUsuarioUseCase()

  const usuario = await findUsuarioUseCase.handler(id)

  return reply.status(200).send(usuario)
}
