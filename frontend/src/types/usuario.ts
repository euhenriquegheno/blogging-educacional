export interface Usuario {
  id: number
  nome: string
  email: string
  tipo: 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO'
}
