import { IPublicacao } from '../entities/models/publicacao.interface'
import { IPublicacaoRepository } from '../repositories/publicacao.repository.interface'

export class CreatePublicacaoUseCase {
  constructor(private publicacaoRepository: IPublicacaoRepository) {}

  async handler(publicacao: IPublicacao): Promise<IPublicacao> {
    return this.publicacaoRepository.create(publicacao)
  }
}
