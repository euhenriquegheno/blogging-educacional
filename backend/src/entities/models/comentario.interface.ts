import { IUsuario } from './usuario.interface'
import { IPublicacao } from './publicacao.interface'

export interface IComentario {
  id?: string
  conteudo: string
  criadoEm?: Date
  usuario: IUsuario
  publicacao: IPublicacao
}
