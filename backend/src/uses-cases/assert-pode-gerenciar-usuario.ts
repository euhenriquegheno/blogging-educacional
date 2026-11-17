import { TipoUsuario } from '../entities/models/tipo-usuario.enum'
import { IUsuarioLogado } from '../entities/models/usuario-logado.interface'
import { ForbiddenError } from './errors/forbidden-error'

/**
 * Professor gerencia professores e alunos, mas nunca contas de Administrador.
 * Sem usuário logado informado (uso interno/testes) a checagem é ignorada.
 */
export function assertPodeGerenciarUsuario(
  usuarioLogado: IUsuarioLogado | undefined,
  ...tiposAlvo: Array<TipoUsuario | undefined>
) {
  if (!usuarioLogado || usuarioLogado.tipo === TipoUsuario.ADMINISTRADOR) {
    return
  }

  if (tiposAlvo.some((tipo) => tipo === TipoUsuario.ADMINISTRADOR)) {
    throw new ForbiddenError()
  }
}
