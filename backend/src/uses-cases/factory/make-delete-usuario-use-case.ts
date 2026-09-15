import { UsuarioRepository } from '../../repositories/typeorm/usuario.repository'
import { DeleteUsuarioUseCase } from '../delete-usuario'

export function makeDeleteUsuarioUseCase() {
  const usuarioRepository = new UsuarioRepository()
  const deleteUsuarioUseCase = new DeleteUsuarioUseCase(usuarioRepository)
  return deleteUsuarioUseCase
}
