import { IPublicacao } from '../entities/models/publicacao.interface'
import { IPublicacaoRepository } from '../repositories/publicacao.repository.interface'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { ForbiddenError } from './errors/forbidden-error'
import { TipoUsuario } from '../entities/models/tipo-usuario.enum'
import { IUsuarioLogado } from '../entities/models/usuario-logado.interface'
import { IUsuarioRepository } from '../repositories/usuario.repository.interface'
import { resolveAutor } from './resolve-autor'

export class UpdatePublicacaoUseCase {
  constructor(
    private publicacaoRepository: IPublicacaoRepository,
    private usuarioRepository?: IUsuarioRepository,
  ) {}

  async handler(
    id: string,
    publicacaoNew: Omit<IPublicacao, 'id' | 'usuario'>,
    usuarioLogado: IUsuarioLogado,
    autorId?: number,
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

    const usuario =
      autorId !== undefined && this.usuarioRepository
        ? await resolveAutor(this.usuarioRepository, autorId)
        : publicacaoOld.usuario

    return this.publicacaoRepository.update({
      ...publicacaoOld,
      ...publicacaoNew,
      usuario,
      id,
    })
  }
}
