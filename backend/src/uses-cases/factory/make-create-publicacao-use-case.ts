import { UsuarioRepository } from '../../repositories/typeorm/usuario.repository'
import { PublicacaoRepository } from '../../repositories/typeorm/publicacao.repository'
import { CreatePublicacaoUseCase } from '../create-publicacao'

export function makeCreatePublicacaoUseCase() {
  const publicacaoRepository = new PublicacaoRepository()
  const createPublicacaoUseCase = new CreatePublicacaoUseCase(
    publicacaoRepository,
    new UsuarioRepository(),
  )
  return createPublicacaoUseCase
}
