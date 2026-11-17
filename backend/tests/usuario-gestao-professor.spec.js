const { TipoUsuario } = require('../build/entities/models/tipo-usuario.enum')
const { CreateUsuarioUseCase } = require('../build/uses-cases/create-usuario')
const { UpdateUsuarioUseCase } = require('../build/uses-cases/update-usuario')
const { DeleteUsuarioUseCase } = require('../build/uses-cases/delete-usuario')
const { FindAllUsuarioUseCase } = require('../build/uses-cases/find-all-usuario')
const { CreatePublicacaoUseCase } = require('../build/uses-cases/create-publicacao')
const { ForbiddenError } = require('../build/uses-cases/errors/forbidden-error')
const { InvalidAuthorError } = require('../build/uses-cases/errors/invalid-author')

class Repo {
  constructor(usuarios = []) {
    this.usuarios = usuarios
    this.filtro = undefined
  }
  async create(u) { this.usuarios.push(u); return u }
  async findAll(_p, _l, filtro) { this.filtro = filtro; return this.usuarios }
  async findById(id) { return this.usuarios.find((u) => u.id === id) ?? null }
  async update(u) { return u }
  async delete(id) { this.usuarios = this.usuarios.filter((u) => u.id !== id); return true }
}

const professor = { id: 2, tipo: TipoUsuario.PROFESSOR }
const admin = { id: 1, tipo: TipoUsuario.ADMINISTRADOR }
const base = { email: 'a@a.com', nome: 'A', cpf: '1' }

describe('Gestão de contas por Professor', () => {
  it('Professor cria Aluno e Professor', async () => {
    const uc = new CreateUsuarioUseCase(new Repo())
    await expect(uc.handler({ ...base, tipo: TipoUsuario.ALUNO }, professor)).resolves.toBeDefined()
    await expect(uc.handler({ ...base, tipo: TipoUsuario.PROFESSOR }, professor)).resolves.toBeDefined()
  })

  it('Professor não cria conta de Administrador', () => {
    const uc = new CreateUsuarioUseCase(new Repo())
    expect(() => uc.handler({ ...base, tipo: TipoUsuario.ADMINISTRADOR }, professor)).toThrow(ForbiddenError)
  })

  it('Administrador cria conta de Administrador', async () => {
    const uc = new CreateUsuarioUseCase(new Repo())
    await expect(uc.handler({ ...base, tipo: TipoUsuario.ADMINISTRADOR }, admin)).resolves.toBeDefined()
  })

  it('Professor não edita nem promove para Administrador', async () => {
    const repo = new Repo([
      { id: 10, ...base, tipo: TipoUsuario.ADMINISTRADOR },
      { id: 11, ...base, tipo: TipoUsuario.ALUNO },
    ])
    const uc = new UpdateUsuarioUseCase(repo)
    await expect(uc.handler(10, { nome: 'X' }, professor)).rejects.toThrow(ForbiddenError)
    await expect(uc.handler(11, { tipo: TipoUsuario.ADMINISTRADOR }, professor)).rejects.toThrow(ForbiddenError)
    await expect(uc.handler(11, { nome: 'Y' }, professor)).resolves.toBeDefined()
  })

  it('Professor não exclui Administrador, mas exclui Aluno', async () => {
    const repo = new Repo([
      { id: 10, ...base, tipo: TipoUsuario.ADMINISTRADOR },
      { id: 11, ...base, tipo: TipoUsuario.ALUNO },
    ])
    const uc = new DeleteUsuarioUseCase(repo)
    await expect(uc.handler(10, professor)).rejects.toThrow(ForbiddenError)
    await expect(uc.handler(11, professor)).resolves.toBeUndefined()
  })

  it('listagem repassa filtro por tipo e oculta Administradores do Professor', async () => {
    const repo = new Repo()
    const uc = new FindAllUsuarioUseCase(repo)
    await uc.handler(1, 10, TipoUsuario.ALUNO, professor)
    expect(repo.filtro).toEqual({ tipo: TipoUsuario.ALUNO, excluirAdministradores: true })
    await expect(uc.handler(1, 10, TipoUsuario.ADMINISTRADOR, professor)).resolves.toEqual([])
    await uc.handler(1, 10, undefined, admin)
    expect(repo.filtro.excluirAdministradores).toBe(false)
  })
})

describe('Autor da publicação (autorId)', () => {
  const pubRepo = { create: async (p) => p }
  const usuarios = new Repo([
    { id: 5, ...base, tipo: TipoUsuario.PROFESSOR },
    { id: 6, ...base, tipo: TipoUsuario.ALUNO },
  ])
  const uc = new CreatePublicacaoUseCase(pubRepo, usuarios)
  const pub = { titulo: 't', conteudo: 'c', usuario: { id: 2 } }

  it('usa o usuário logado quando autorId não é informado', async () => {
    expect((await uc.handler(pub)).usuario.id).toBe(2)
  })

  it('usa o autor escolhido quando é Professor', async () => {
    expect((await uc.handler(pub, 5)).usuario.id).toBe(5)
  })

  it('rejeita Aluno como autor e autor inexistente', async () => {
    await expect(uc.handler(pub, 6)).rejects.toThrow(InvalidAuthorError)
    await expect(uc.handler(pub, 99)).rejects.toThrow('Autor não encontrado')
  })
})
