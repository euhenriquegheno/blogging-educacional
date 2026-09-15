import { PublicacaoRepository } from '../../repositories/typeorm/publicacao.repository'
import { DeletePublicacaoUseCase } from '../delete-publicacao'

export function makeDeletePublicacaoUseCase() {
  const publicacaoRepository = new PublicacaoRepository()
  const deletePublicacaoUseCase = new DeletePublicacaoUseCase(
    publicacaoRepository,
  )
  return deletePublicacaoUseCase
}
