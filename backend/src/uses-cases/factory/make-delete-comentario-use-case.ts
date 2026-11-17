import { ComentarioRepository } from '../../repositories/typeorm/comentario.repository'
import { DeleteComentarioUseCase } from '../delete-comentario'

export function makeDeleteComentarioUseCase() {
  return new DeleteComentarioUseCase(new ComentarioRepository())
}
