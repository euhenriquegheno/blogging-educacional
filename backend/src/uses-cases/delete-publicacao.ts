import { IPublicacaoRepository } from '../repositories/publicacao.repository.interface'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { ForbiddenError } from './errors/forbidden-error'
import { TipoUsuario } from '../entities/models/tipo-usuario.enum'
import { IUsuarioLogado } from '../entities/models/usuario-logado.interface'

export class DeletePublicacaoUseCase {
  constructor(private publicacaoRepository: IPublicacaoRepository) {}

  async handler(id: string, usuarioLogado: IUsuarioLogado): Promise<void> {
    const publicacao = await this.publicacaoRepository.findById(id)

    if (!publicacao) {
      throw new ResourceNotFoundError('Publicação não encontrada')
    }

    if (
      usuarioLogado.tipo === TipoUsuario.PROFESSOR &&
      usuarioLogado.id !== publicacao.usuario.id
    ) {
      throw new ForbiddenError()
    }

    const deleted = await this.publicacaoRepository.delete(id)

    if (!deleted) {
      throw new ResourceNotFoundError('Publicação não encontrada')
    }
  }
}
