import { IComentarioRepository } from '../repositories/comentario.repository.interface'
import { IUsuarioLogado } from '../entities/models/usuario-logado.interface'
import { TipoUsuario } from '../entities/models/tipo-usuario.enum'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { ForbiddenError } from './errors/forbidden-error'

export class DeleteComentarioUseCase {
  constructor(private comentarioRepository: IComentarioRepository) {}

  async handler(id: string, usuarioLogado: IUsuarioLogado) {
    const comentario = await this.comentarioRepository.findById(id)

    if (!comentario) {
      throw new ResourceNotFoundError('Comentário não encontrado')
    }

    const podeExcluir =
      usuarioLogado.tipo === TipoUsuario.ADMINISTRADOR ||
      usuarioLogado.tipo === TipoUsuario.PROFESSOR ||
      comentario.usuario.id === usuarioLogado.id

    if (!podeExcluir) {
      throw new ForbiddenError()
    }

    const deleted = await this.comentarioRepository.delete(id)

    if (!deleted) {
      throw new ResourceNotFoundError('Comentário não encontrado')
    }
  }
}
