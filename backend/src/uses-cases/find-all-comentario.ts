import { IComentarioRepository } from '../repositories/comentario.repository.interface'

export class FindAllComentarioUseCase {
  constructor(private comentarioRepository: IComentarioRepository) {}

  async handler(publicacaoId: string, page: number, limit: number) {
    const comentarios = await this.comentarioRepository.findAllByPublicacaoId(
      publicacaoId,
      page,
      limit,
    )
    return comentarios
  }
}
