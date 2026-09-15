import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeFindAllComentarioUseCase } from '../../../uses-cases/factory/make-find-all-comentario-use-case'

export async function findAllComentario(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const findAllComentarioParamsSchema = z.object({
    id: z.string(),
  })

  const findAllComentarioQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  })

  const { id: publicacaoId } = findAllComentarioParamsSchema.parse(
    request.params,
  )
  const { page, limit } = findAllComentarioQuerySchema.parse(request.query)

  const findAllComentarioUseCase = makeFindAllComentarioUseCase()
  const comentarios = await findAllComentarioUseCase.handler(
    publicacaoId,
    page,
    limit,
  )

  return reply.status(200).send(comentarios)
}
