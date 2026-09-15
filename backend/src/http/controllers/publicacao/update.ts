import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeUpdatePublicacaoUseCase } from '../../../uses-cases/factory/make-update-publicacao-use-case'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const registerParamsSchema = z.object({
    id: z.uuid(),
  })

  const { id } = registerParamsSchema.parse(request.params)

  const registerBodySchema = z.object({
    titulo: z.string(),
    conteudo: z.string(),
  })

  const { titulo, conteudo } = registerBodySchema.parse(request.body)

  const updatePublicacaoUseCase = makeUpdatePublicacaoUseCase()
  const publicacao = await updatePublicacaoUseCase.handler(
    id,
    {
      titulo,
      conteudo,
    },
    { id: request.user.sub, tipo: request.user.tipo },
  )

  return reply.status(200).send(publicacao)
}
