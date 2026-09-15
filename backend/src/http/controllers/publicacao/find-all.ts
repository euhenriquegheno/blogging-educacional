import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeFindAllPublicacaoUseCase } from '../../../uses-cases/factory/make-find-all-publicacao-use-case'

export async function findAllPublicacao(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  })

  const { page, limit } = registerQuerySchema.parse(request.query)

  const findAllPublicacaoUseCase = makeFindAllPublicacaoUseCase()
  const publicacoes = await findAllPublicacaoUseCase.handler(page, limit)

  return reply.status(200).send(publicacoes)
}
