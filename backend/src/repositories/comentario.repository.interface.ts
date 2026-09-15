import { IComentario } from '../entities/models/comentario.interface'

export interface IComentarioRepository {
  create(comentario: IComentario): Promise<IComentario>
  findAllByPublicacaoId(
    publicacaoId: string,
    page: number,
    limit: number,
  ): Promise<IComentario[]>
  delete(id: string): Promise<boolean>
}
