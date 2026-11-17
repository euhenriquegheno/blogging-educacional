import { IUsuario } from '../entities/models/usuario.interface'
import { IUsuarioLogado } from '../entities/models/usuario-logado.interface'
import { assertPodeGerenciarUsuario } from './assert-pode-gerenciar-usuario'
import { IUsuarioRepository } from '../repositories/usuario.repository.interface'

export class CreateUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  handler(usuario: IUsuario, usuarioLogado?: IUsuarioLogado) {
    assertPodeGerenciarUsuario(usuarioLogado, usuario.tipo)
    return this.usuarioRepository.create(usuario)
  }
}
