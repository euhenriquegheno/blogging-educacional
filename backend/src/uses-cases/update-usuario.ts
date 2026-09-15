import { IUsuario } from '../entities/models/usuario.interface'
import { IUsuarioRepository } from '../repositories/usuario.repository.interface'
import { ResourceNotFoundError } from './errors/resource-not-found'

export class UpdateUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async handler(id: number, usuarioNew: Partial<IUsuario>) {
    const usuarioOld = await this.usuarioRepository.findById(id)

    if (!usuarioOld) {
      throw new ResourceNotFoundError('Usuário não encontrado')
    }

    return this.usuarioRepository.update({
      ...usuarioOld,
      ...usuarioNew,
      id,
    })
  }
}
