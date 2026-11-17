import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeDeleteComentarioUseCase } from '../../../uses-cases/factory/make-delete-comentario-use-case'

export async function deleteComentario(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = z.object({ id: z.string() }).parse(request.params)

  const deleteComentarioUseCase = makeDeleteComentarioUseCase()
  await deleteComentarioUseCase.handler(id, {
    id: request.user.sub,
    tipo: request.user.tipo,
  })

  return reply.status(204).send()
}
