import { FastifyReply, FastifyRequest } from 'fastify'
import { TipoUsuario } from '../../entities/models/tipo-usuario.enum'

export function verifyUserType(tiposPermitidos: TipoUsuario[]) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const { tipo } = request.user

    if (!tiposPermitidos.includes(tipo)) {
      return reply.status(403).send({ message: 'Forbidden' })
    }
  }
}
