import { PublicacaoRepository } from '../../repositories/typeorm/publicacao.repository'
import { CreatePublicacaoUseCase } from '../create-publicacao'

export function makeCreatePublicacaoUseCase() {
  const publicacaoRepository = new PublicacaoRepository()
  const createPublicacaoUseCase = new CreatePublicacaoUseCase(
    publicacaoRepository,
  )
  return createPublicacaoUseCase
}
