import { FastifyReply, FastifyRequest } from 'fastify'
import { makeDeletePublicacaoUseCase } from '../../../uses-cases/factory/make-delete-publicacao-use-case'
import z from 'zod'

export async function deletePublicacao(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerParamsSchema = z.object({
    id: z.uuid(),
  })

  const { id } = registerParamsSchema.parse(request.params)

  const deletePublicacaoUseCase = makeDeletePublicacaoUseCase()
  await deletePublicacaoUseCase.handler(id, {
    id: request.user.sub,
    tipo: request.user.tipo,
  })

  return reply.status(204).send()
}
