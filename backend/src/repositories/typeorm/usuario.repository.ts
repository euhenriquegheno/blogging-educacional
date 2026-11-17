import { Not, Repository } from 'typeorm'
import { TipoUsuario } from '../../entities/models/tipo-usuario.enum'
import { IUsuario } from '../../entities/models/usuario.interface'
import { FiltroUsuarios, IUsuarioRepository } from '../usuario.repository.interface'
import { Usuario } from '../../entities/usuario.entity'
import { appDataSource } from '../../lib/typeorm/typeorm'

export class UsuarioRepository implements IUsuarioRepository {
  private repository: Repository<Usuario>

  constructor() {
    this.repository = appDataSource.getRepository(Usuario)
  }

  async create(usuario: IUsuario): Promise<IUsuario> {
    return this.repository.save(usuario)
  }

  async findAll(
    page: number,
    limit: number,
    filtro: FiltroUsuarios = {},
  ): Promise<IUsuario[]> {
    const where = filtro.tipo
      ? { tipo: filtro.tipo }
      : filtro.excluirAdministradores
        ? { tipo: Not(TipoUsuario.ADMINISTRADOR) }
        : {}

    return this.repository.find({
      where,
      order: { nome: 'ASC' },
      select: {
        id: true,
        email: true,
        nome: true,
        cpf: true,
        tipo: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    })
  }

  async findById(id: number): Promise<IUsuario | null> {
    return this.repository.findOne({
      select: {
        id: true,
        email: true,
        nome: true,
        cpf: true,
        tipo: true,
      },
      where: { id },
    })
  }

  async findByEmail(email: string): Promise<IUsuario | null> {
    return this.repository.findOne({
      select: {
        id: true,
        email: true,
        senha: true,
        nome: true,
        cpf: true,
        tipo: true,
      },
      where: { email },
    })
  }

  update(usuario: IUsuario): Promise<IUsuario> {
    return this.repository.save(usuario)
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id)

    return result.affected !== 0
  }
}
