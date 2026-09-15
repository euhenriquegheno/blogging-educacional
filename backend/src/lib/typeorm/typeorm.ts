import { DataSource } from 'typeorm'

import { env } from '../../env'
import { Usuario } from '../../entities/usuario.entity'
import { Publicacao } from '../../entities/publicacao.entity'
import { Comentario } from '../../entities/comentario.entity'

export const appDataSource = new DataSource({
  type: 'mysql',
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  logging: env.NODE_ENV === 'development',
  synchronize: env.NODE_ENV === 'development',
  entities: [Usuario, Publicacao, Comentario],
})

export async function initializeDataSource() {
  if (!appDataSource.isInitialized) {
    await appDataSource.initialize()
    console.log('Database with typeorm connected!')
  }
}
