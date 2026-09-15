import { Usuario } from '../usuario.entity'

export interface IPublicacao {
  id?: string
  titulo: string
  conteudo: string
  usuario: Usuario
}
