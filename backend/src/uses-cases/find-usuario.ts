import { IUsuarioRepository } from '../repositories/usuario.repository.interface'
import { ResourceNotFoundError } from './errors/resource-not-found'

export class FindUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async handler(id: number) {
    const usuario = await this.usuarioRepository.findById(id)

    if (!usuario) {
      throw new ResourceNotFoundError('Usuário não encontrado')
    }
    return usuario
  }
}
