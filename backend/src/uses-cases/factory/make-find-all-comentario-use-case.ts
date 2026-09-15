import { ComentarioRepository } from '../../repositories/typeorm/comentario.repository'
import { FindAllComentarioUseCase } from '../find-all-comentario'

export function makeFindAllComentarioUseCase() {
  const comentarioRepository = new ComentarioRepository()
  const findAllComentarioUseCase = new FindAllComentarioUseCase(
    comentarioRepository,
  )
  return findAllComentarioUseCase
}
