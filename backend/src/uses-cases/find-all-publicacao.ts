import { IPublicacaoRepository } from '../repositories/publicacao.repository.interface'

export class FindAllPublicacaoUseCase {
  constructor(private publicacaoRepository: IPublicacaoRepository) {}

  async handler(page: number, limit: number) {
    const publicacoes = await this.publicacaoRepository.findAll(page, limit)
    return publicacoes
  }
}
