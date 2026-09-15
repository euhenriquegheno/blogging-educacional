import { PublicacaoRepository } from '../../repositories/typeorm/publicacao.repository'
import { FindPublicacaoUseCase } from '../find-publicacao'

export function makeFindPublicacaoUseCase() {
  const publicacaoRepository = new PublicacaoRepository()
  const findPublicacaoUseCase = new FindPublicacaoUseCase(publicacaoRepository)
  return findPublicacaoUseCase
}
