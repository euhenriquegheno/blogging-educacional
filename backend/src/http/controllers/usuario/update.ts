import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { hash } from 'bcrypt'
import { makeUpdateUsuarioUseCase } from '../../../uses-cases/factory/make-update-usuario-use-case'
import { IUsuario } from '../../../entities/models/usuario.interface'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const registerParamsSchema = z.object({
    id: z.coerce.number().int(),
  })

  const { id } = registerParamsSchema.parse(request.params)

  const registerBodySchema = z.object({
    email: z.string(),
    nome: z.string(),
    senha: z.string().optional(),
    cpf: z.string(),
    tipo: z.number().int(),
  })

  const { email, nome, senha, cpf, tipo } = registerBodySchema.parse(
    request.body,
  )

  const dadosAtualizados: Partial<IUsuario> = { email, nome, cpf, tipo }

  if (senha) {
    dadosAtualizados.senha = await hash(senha, 8)
  }

  const updateUsuarioUseCase = makeUpdateUsuarioUseCase()
  const usuario = await updateUsuarioUseCase.handler(id, dadosAtualizados)

  return reply.status(200).send({
    id: usuario?.id,
    email: usuario?.email,
    nome: usuario?.nome,
    cpf: usuario?.cpf,
    tipo: usuario?.tipo,
  })
}
