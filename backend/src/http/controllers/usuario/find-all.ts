import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeFindAllUsuarioUseCase } from '../../../uses-cases/factory/make-find-all-usuario-use-case'

export async function findAllUsuarios(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerQuerySchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
  })

  const { page, limit } = registerQuerySchema.parse(request.query)

  const findAllUsuariosUseCase = makeFindAllUsuarioUseCase()
  const usuarios = await findAllUsuariosUseCase.handler(page, limit)

  return reply.status(200).send(usuarios)
}
