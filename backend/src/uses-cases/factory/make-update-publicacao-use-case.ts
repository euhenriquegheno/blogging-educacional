import { UsuarioRepository } from '../../repositories/typeorm/usuario.repository'
import { PublicacaoRepository } from '../../repositories/typeorm/publicacao.repository'
import { UpdatePublicacaoUseCase } from '../update-publicacao'

export function makeUpdatePublicacaoUseCase() {
  const publicacaoRepository = new PublicacaoRepository()
  const updatePublicacaoUseCase = new UpdatePublicacaoUseCase(
    publicacaoRepository,
    new UsuarioRepository(),
  )
  return updatePublicacaoUseCase
}
