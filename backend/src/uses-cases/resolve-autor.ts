import { Usuario } from '../entities/usuario.entity'
import { TipoUsuario } from '../entities/models/tipo-usuario.enum'
import { IUsuarioRepository } from '../repositories/usuario.repository.interface'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { InvalidAuthorError } from './errors/invalid-author'

/**
 * Valida o autor escolhido para uma publicação: precisa existir e ser
 * Professor ou Administrador.
 */
export async function resolveAutor(
  usuarioRepository: IUsuarioRepository,
  autorId: number,
): Promise<Usuario> {
  const autor = await usuarioRepository.findById(autorId)

  if (!autor) {
    throw new ResourceNotFoundError('Autor não encontrado')
  }

  if (autor.tipo === TipoUsuario.ALUNO) {
    throw new InvalidAuthorError()
  }

  return { id: autor.id } as Usuario
}
