import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { IComentario } from './models/comentario.interface'
import { Usuario } from './usuario.entity'
import { Publicacao } from './publicacao.entity'

@Entity({
  name: 'comentario',
})
export class Comentario implements IComentario {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string

  @Column({ name: 'conteudo', type: 'text' })
  conteudo!: string

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario

  @ManyToOne(() => Publicacao)
  @JoinColumn({ name: 'publicacao_id' })
  publicacao!: Publicacao
}
