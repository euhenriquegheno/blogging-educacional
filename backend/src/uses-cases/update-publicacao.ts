import { IPublicacao } from '../entities/models/publicacao.interface'
import { IPublicacaoRepository } from '../repositories/publicacao.repository.interface'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { ForbiddenError } from './errors/forbidden-error'
import { TipoUsuario } from '../entities/models/tipo-usuario.enum'
import { IUsuarioLogado } from '../entities/models/usuario-logado.interface'

export class UpdatePublicacaoUseCase {
  constructor(private publicacaoRepository: IPublicacaoRepository) {}

  async handler(
    id: string,
    publicacaoNew: Omit<IPublicacao, 'id' | 'usuario'>,
    usuarioLogado: IUsuarioLogado,
  ) {
    const publicacaoOld = await this.publicacaoRepository.findById(id)

    if (!publicacaoOld) {
      throw new ResourceNotFoundError('Publicação não encontrada')
    }

    if (
      usuarioLogado.tipo === TipoUsuario.PROFESSOR &&
      usuarioLogado.id !== publicacaoOld.usuario.id
    ) {
      throw new ForbiddenError()
    }

    return this.publicacaoRepository.update({
      ...publicacaoOld,
      ...publicacaoNew,
      id,
    })
  }
}
