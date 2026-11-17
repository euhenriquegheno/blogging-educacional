import { IUsuarioRepository } from '../repositories/usuario.repository.interface'
import { IUsuarioLogado } from '../entities/models/usuario-logado.interface'
import { assertPodeGerenciarUsuario } from './assert-pode-gerenciar-usuario'
import { ResourceNotFoundError } from './errors/resource-not-found'

export class DeleteUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async handler(id: number, usuarioLogado?: IUsuarioLogado) {
    if (usuarioLogado) {
      const alvo = await this.usuarioRepository.findById(id)

      if (!alvo) {
        throw new ResourceNotFoundError('Usuário não encontrado')
      }

      assertPodeGerenciarUsuario(usuarioLogado, alvo.tipo)
    }

    const deleted = await this.usuarioRepository.delete(id)

    if (!deleted) {
      throw new ResourceNotFoundError('Usuário não encontrado')
    }
  }
}
