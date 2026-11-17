import { IPublicacao } from '../entities/models/publicacao.interface'
import { IPublicacaoRepository } from '../repositories/publicacao.repository.interface'
import { IUsuarioRepository } from '../repositories/usuario.repository.interface'
import { resolveAutor } from './resolve-autor'

export class CreatePublicacaoUseCase {
  constructor(
    private publicacaoRepository: IPublicacaoRepository,
    private usuarioRepository?: IUsuarioRepository,
  ) {}

  async handler(
    publicacao: IPublicacao,
    autorId?: number,
  ): Promise<IPublicacao> {
    if (autorId !== undefined && this.usuarioRepository) {
      publicacao = {
        ...publicacao,
        usuario: await resolveAutor(this.usuarioRepository, autorId),
      }
    }

    return this.publicacaoRepository.create(publicacao)
  }
}
