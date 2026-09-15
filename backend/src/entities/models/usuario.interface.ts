import { TipoUsuario } from './tipo-usuario.enum'

export interface IUsuario {
  id?: number
  email: string
  senha: string
  nome: string
  cpf: string
  tipo: TipoUsuario
}
