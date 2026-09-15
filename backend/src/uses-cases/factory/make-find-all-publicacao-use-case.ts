import { PublicacaoRepository } from '../../repositories/typeorm/publicacao.repository'
import { FindAllPublicacaoUseCase } from '../find-all-publicacao'

export function makeFindAllPublicacaoUseCase() {
  const publicacaoRepository = new PublicacaoRepository()
  const findAllPublicacaoUseCase = new FindAllPublicacaoUseCase(
    publicacaoRepository,
  )
  return findAllPublicacaoUseCase
}
