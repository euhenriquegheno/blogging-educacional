import { UsuarioRepository } from '../../repositories/typeorm/usuario.repository'
import { AuthenticateUseCase } from '../authenticate'

export function makeAuthenticateUseCase() {
  const usuarioRepository = new UsuarioRepository()
  const authenticateUseCase = new AuthenticateUseCase(usuarioRepository)
  return authenticateUseCase
}
