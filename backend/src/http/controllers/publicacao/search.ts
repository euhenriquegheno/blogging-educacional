import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeSearchPublicacaoUseCase } from '../../../uses-cases/factory/make-search-publicacao-use-case'

export async function searchPublicacoes(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const searchQuerySchema = z.object({
    q: z.string().trim().min(1),
  })

  const { q } = searchQuerySchema.parse(request.query)
  const searchPublicacaoUseCase = makeSearchPublicacaoUseCase()
  const publicacoes = await searchPublicacaoUseCase.handler(q)

  return reply.status(200).send(publicacoes)
}
