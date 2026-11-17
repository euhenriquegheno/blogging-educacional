import { TipoUsuario } from '../entities/models/tipo-usuario.enum'
import { IUsuario } from '../entities/models/usuario.interface'

export interface FiltroUsuarios {
  tipo?: TipoUsuario | undefined
  excluirAdministradores?: boolean
}

export interface IUsuarioRepository {
  create(pessoa: IUsuario): Promise<IUsuario | undefined>
  findAll(
    page: number,
    limit: number,
    filtro?: FiltroUsuarios,
  ): Promise<IUsuario[] | undefined>
  findById(id: number): Promise<IUsuario | null>
  findByEmail(email: string): Promise<IUsuario | null>
  update(pessoa: IUsuario): Promise<IUsuario | undefined>
  delete(id: number): Promise<boolean>
}
