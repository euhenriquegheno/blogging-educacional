import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeDeleteUsuarioUseCase } from '../../../uses-cases/factory/make-delete-usuario-use-case'

export async function deleteUsuario(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerParamsSchema = z.object({
    id: z.coerce.number(),
  })

  const { id } = registerParamsSchema.parse(request.params)

  const deleteUsuarioUseCase = makeDeleteUsuarioUseCase()
  await deleteUsuarioUseCase.handler(id)

  return reply.status(204).send()
}
