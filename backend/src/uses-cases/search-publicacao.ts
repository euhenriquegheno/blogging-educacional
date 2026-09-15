import { IPublicacaoRepository } from '../repositories/publicacao.repository.interface'

export class SearchPublicacaoUseCase {
  constructor(private publicacaoRepository: IPublicacaoRepository) {}

  async handler(term: string) {
    return this.publicacaoRepository.search(term)
  }
}
