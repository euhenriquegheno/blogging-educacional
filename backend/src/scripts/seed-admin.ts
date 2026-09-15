import { hash } from 'bcrypt'
import { appDataSource, initializeDataSource } from '../lib/typeorm/typeorm'
import { Usuario } from '../entities/usuario.entity'
import { TipoUsuario } from '../entities/models/tipo-usuario.enum'

async function seedAdmin() {
  await initializeDataSource()

  const repository = appDataSource.getRepository(Usuario)

  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@blog.com'
  const senha = process.env.SEED_ADMIN_SENHA ?? 'admin123'
  const nome = process.env.SEED_ADMIN_NOME ?? 'Administrador'
  const cpf = process.env.SEED_ADMIN_CPF ?? '00000000000'

  const existente = await repository.findOne({ where: { email } })

  if (existente) {
    console.log(`Usuário ${email} já existe, nada a fazer.`)
    await appDataSource.destroy()
    return
  }

  const senhaHash = await hash(senha, 8)

  await repository.save({
    email,
    senha: senhaHash,
    nome,
    cpf,
    tipo: TipoUsuario.ADMINISTRADOR,
  })

  console.log('Administrador criado com sucesso:')
  console.log(`  email: ${email}`)
  console.log(`  senha: ${senha}`)

  await appDataSource.destroy()
}

seedAdmin().catch((error) => {
  console.error('Falha ao criar administrador inicial:', error)
  process.exit(1)
})
