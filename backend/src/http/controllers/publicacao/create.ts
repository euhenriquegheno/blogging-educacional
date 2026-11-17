import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeCreatePublicacaoUseCase } from '../../../uses-cases/factory/make-create-publicacao-use-case'
import { Usuario } from '../../../entities/usuario.entity'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    titulo: z.string(),
    conteudo: z.string(),
    autorId: z.coerce.number().int().positive().optional(),
  })

  const { titulo, conteudo, autorId } = registerBodySchema.parse(request.body)

  const createPublicacaoUseCase = makeCreatePublicacaoUseCase()

  const publicacao = await createPublicacaoUseCase.handler(
    {
      titulo,
      conteudo,
      usuario: {
        id: request.user.sub,
      } as Usuario,
    },
    autorId,
  )

  return reply.status(201).send(publicacao)
}
