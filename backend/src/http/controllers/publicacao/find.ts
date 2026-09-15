import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeFindPublicacaoUseCase } from '../../../uses-cases/factory/make-find-publicacao-use-case'

export async function findPublicacao(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerParamsSchema = z.object({
    id: z.uuid(),
  })

  const { id } = registerParamsSchema.parse(request.params)
  const findPublicacaoUseCase = makeFindPublicacaoUseCase()

  const publicacao = await findPublicacaoUseCase.handler(id)

  return reply.status(200).send(publicacao)
}
