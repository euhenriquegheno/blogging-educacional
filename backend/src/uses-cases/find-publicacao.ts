import { IPublicacaoRepository } from '../repositories/publicacao.repository.interface'
import { ResourceNotFoundError } from './errors/resource-not-found'

export class FindPublicacaoUseCase {
  constructor(private publicacaoRepository: IPublicacaoRepository) {}

  async handler(id: string) {
    const product = await this.publicacaoRepository.findById(id)

    if (!product) {
      throw new ResourceNotFoundError('Publicação não encontrada')
    }
    return product
  }
}
