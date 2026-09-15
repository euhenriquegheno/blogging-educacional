import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { IPublicacao } from './models/publicacao.interface'
import { Usuario } from './usuario.entity'

@Entity({
  name: 'publicacao',
})
export class Publicacao implements IPublicacao {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string

  @Column({ name: 'titulo', type: 'varchar' })
  titulo!: string

  @Column({ name: 'conteudo', type: 'text' })
  conteudo!: string

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario
}
