import { IUsuarioRepository } from '../repositories/usuario.repository.interface'
import { ResourceNotFoundError } from './errors/resource-not-found'

export class DeleteUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async handler(id: number) {
    const deleted = await this.usuarioRepository.delete(id)

    if (!deleted) {
      throw new ResourceNotFoundError('Usuário não encontrado')
    }
  }
}
