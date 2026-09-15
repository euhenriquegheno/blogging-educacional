import { PublicacaoRepository } from '../../repositories/typeorm/publicacao.repository'
import { SearchPublicacaoUseCase } from '../search-publicacao'

export function makeSearchPublicacaoUseCase() {
  const publicacaoRepository = new PublicacaoRepository()
  return new SearchPublicacaoUseCase(publicacaoRepository)
}
