import { IPublicacao } from '../entities/models/publicacao.interface'

export interface IPublicacaoRepository {
  findAll(page: number, limit: number): Promise<IPublicacao[]>
  search(term: string): Promise<IPublicacao[]>
  findById(id: string): Promise<IPublicacao | null>
  create(publicacao: IPublicacao): Promise<IPublicacao>
  update(publicacao: IPublicacao): Promise<IPublicacao>
  delete(id: string): Promise<boolean>
}
