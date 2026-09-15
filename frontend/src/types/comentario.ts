import type { Usuario } from './usuario'

export interface Comentario {
  id: string
  conteudo: string
  criadoEm: string
  usuario: Usuario
}
