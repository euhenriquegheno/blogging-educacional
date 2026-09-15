import { IUsuarioRepository } from '../repositories/usuario.repository.interface'

export class FindAllUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async handler(page: number, limit: number) {
    const usuarios = await this.usuarioRepository.findAll(page, limit)
    return usuarios
  }
}
