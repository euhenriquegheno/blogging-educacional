import { ILike, Repository } from 'typeorm'
import { IPublicacaoRepository } from '../publicacao.repository.interface'
import { Publicacao } from '../../entities/publicacao.entity'
import { appDataSource } from '../../lib/typeorm/typeorm'
import { IPublicacao } from '../../entities/models/publicacao.interface'

export class PublicacaoRepository implements IPublicacaoRepository {
  private repository: Repository<Publicacao>

  constructor() {
    this.repository = appDataSource.getRepository(Publicacao)
  }

  async findAll(page: number, limit: number): Promise<IPublicacao[]> {
    return this.repository.find({
      select: {
        id: true,
        titulo: true,
        conteudo: true,
        usuario: {
          id: true,
          nome: true,
          email: true,
        },
      },
      relations: { usuario: true },
      skip: (page - 1) * limit,
      take: limit,
    })
  }

  async findById(id: string): Promise<IPublicacao | null> {
    return this.repository.findOne({
      select: {
        id: true,
        titulo: true,
        conteudo: true,
        usuario: {
          id: true,
          nome: true,
          email: true,
        },
      },
      relations: { usuario: true },
      where: { id },
    })
  }

  async search(term: string): Promise<IPublicacao[]> {
    const matchingTerm = ILike(`%${term}%`)

    return this.repository.find({
      select: {
        id: true,
        titulo: true,
        conteudo: true,
        usuario: {
          id: true,
          nome: true,
          email: true,
        },
      },
      relations: { usuario: true },
      where: [{ titulo: matchingTerm }, { conteudo: matchingTerm }],
    })
  }

  async create(publicacao: IPublicacao): Promise<IPublicacao> {
    return this.repository.save(publicacao)
  }

  update(publicacao: IPublicacao): Promise<IPublicacao> {
    return this.repository.save(publicacao)
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id)

    return result.affected !== 0
  }
}
