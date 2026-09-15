import { Repository } from 'typeorm'
import { IComentarioRepository } from '../comentario.repository.interface'
import { Comentario } from '../../entities/comentario.entity'
import { appDataSource } from '../../lib/typeorm/typeorm'
import { IComentario } from '../../entities/models/comentario.interface'

export class ComentarioRepository implements IComentarioRepository {
  private repository: Repository<Comentario>

  constructor() {
    this.repository = appDataSource.getRepository(Comentario)
  }

  async create(comentario: IComentario): Promise<IComentario> {
    return this.repository.save(comentario)
  }

  async findAllByPublicacaoId(
    publicacaoId: string,
    page: number,
    limit: number,
  ): Promise<IComentario[]> {
    return this.repository.find({
      select: {
        id: true,
        conteudo: true,
        criadoEm: true,
        usuario: {
          id: true,
          nome: true,
          email: true,
        },
      },
      relations: { usuario: true },
      where: { publicacao: { id: publicacaoId } },
      order: { criadoEm: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id)

    return result.affected !== 0
  }
}
