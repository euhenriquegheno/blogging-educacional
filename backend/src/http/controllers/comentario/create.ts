import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeCreateComentarioUseCase } from '../../../uses-cases/factory/make-create-comentario-use-case'
import { Usuario } from '../../../entities/usuario.entity'
import { Publicacao } from '../../../entities/publicacao.entity'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createComentarioParamsSchema = z.object({
    id: z.string(),
  })

  const createComentarioBodySchema = z.object({
    conteudo: z.string().min(1),
  })

  const { id: publicacaoId } = createComentarioParamsSchema.parse(
    request.params,
  )
  const { conteudo } = createComentarioBodySchema.parse(request.body)

  const createComentarioUseCase = makeCreateComentarioUseCase()

  const comentario = await createComentarioUseCase.handler({
    conteudo,
    usuario: {
      id: request.user.sub,
    } as Usuario,
    publicacao: {
      id: publicacaoId,
    } as Publicacao,
  })

  return reply.status(201).send(comentario)
}
