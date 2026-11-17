import { IUsuarioRepository } from '../repositories/usuario.repository.interface'
import { IUsuarioLogado } from '../entities/models/usuario-logado.interface'
import { assertPodeGerenciarUsuario } from './assert-pode-gerenciar-usuario'
import { ResourceNotFoundError } from './errors/resource-not-found'

export class FindUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async handler(id: number, usuarioLogado?: IUsuarioLogado) {
    const usuario = await this.usuarioRepository.findById(id)

    if (!usuario) {
      throw new ResourceNotFoundError('Usuário não encontrado')
    }
    assertPodeGerenciarUsuario(usuarioLogado, usuario.tipo)
    return usuario
  }
}
