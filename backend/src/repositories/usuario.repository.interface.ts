import { IUsuario } from '../entities/models/usuario.interface'

export interface IUsuarioRepository {
  create(pessoa: IUsuario): Promise<IUsuario | undefined>
  findAll(page: number, limit: number): Promise<IUsuario[] | undefined>
  findById(id: number): Promise<IUsuario | null>
  findByEmail(email: string): Promise<IUsuario | null>
  update(pessoa: IUsuario): Promise<IUsuario | undefined>
  delete(id: number): Promise<boolean>
}
