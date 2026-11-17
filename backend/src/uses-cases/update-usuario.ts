import { IUsuario } from '../entities/models/usuario.interface'
import { IUsuarioRepository } from '../repositories/usuario.repository.interface'
import { IUsuarioLogado } from '../entities/models/usuario-logado.interface'
import { assertPodeGerenciarUsuario } from './assert-pode-gerenciar-usuario'
import { ResourceNotFoundError } from './errors/resource-not-found'

export class UpdateUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async handler(
    id: number,
    usuarioNew: Partial<IUsuario>,
    usuarioLogado?: IUsuarioLogado,
  ) {
    const usuarioOld = await this.usuarioRepository.findById(id)

    if (!usuarioOld) {
      throw new ResourceNotFoundError('Usuário não encontrado')
    }

    assertPodeGerenciarUsuario(usuarioLogado, usuarioOld.tipo, usuarioNew.tipo)

    return this.usuarioRepository.update({
      ...usuarioOld,
      ...usuarioNew,
      id,
    })
  }
}
