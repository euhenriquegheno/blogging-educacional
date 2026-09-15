import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeCreateUsuarioUseCase } from '../../../uses-cases/factory/make-create-usuario-use-case'
import { hash } from 'bcrypt'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    email: z.string(),
    senha: z.string(),
    nome: z.string(),
    cpf: z.string(),
    tipo: z.coerce.number(),
  })

  const { email, senha, nome, cpf, tipo } = registerBodySchema.parse(
    request.body,
  )

  const hashedPassword = await hash(senha, 8)

  const userWithHashedPassword = {
    email,
    senha: hashedPassword,
    nome,
    cpf,
    tipo,
  }

  const createPessoaUseCase = makeCreateUsuarioUseCase()

  const usuario = await createPessoaUseCase.handler(userWithHashedPassword)

  return reply.status(201).send({
    id: usuario?.id,
    email: usuario?.email,
    nome: usuario?.nome,
    cpf: usuario?.cpf,
    tipo: usuario?.tipo,
  })
}
