import type { Usuario } from './usuario'

export interface Publicacao {
  id: string
  titulo: string
  conteudo: string
  usuario: Usuario
}
