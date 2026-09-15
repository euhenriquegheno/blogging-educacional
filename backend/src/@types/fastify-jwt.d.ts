import { TipoUsuario } from '../entities/models/tipo-usuario.enum'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: number
      tipo: TipoUsuario
    }
    user: {
      sub: number
      tipo: TipoUsuario
    }
  }
}
