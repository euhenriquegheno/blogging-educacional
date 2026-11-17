import { TipoUsuario } from '../entities/models/tipo-usuario.enum'
import { IUsuarioLogado } from '../entities/models/usuario-logado.interface'
import { IUsuarioRepository } from '../repositories/usuario.repository.interface'

export class FindAllUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async handler(
    page: number,
    limit: number,
    tipo?: TipoUsuario,
    usuarioLogado?: IUsuarioLogado,
  ) {
    const excluirAdministradores =
      !!usuarioLogado && usuarioLogado.tipo !== TipoUsuario.ADMINISTRADOR

    // Professor nunca enxerga contas de Administrador
    if (excluirAdministradores && tipo === TipoUsuario.ADMINISTRADOR) {
      return []
    }

    const usuarios = await this.usuarioRepository.findAll(page, limit, {
      tipo,
      excluirAdministradores,
    })
    return usuarios
  }
}
