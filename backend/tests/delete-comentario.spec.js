const {
  DeleteComentarioUseCase,
} = require('../build/uses-cases/delete-comentario')
const {
  ResourceNotFoundError,
} = require('../build/uses-cases/errors/resource-not-found')
const { ForbiddenError } = require('../build/uses-cases/errors/forbidden-error')
const { TipoUsuario } = require('../build/entities/models/tipo-usuario.enum')

function makeRepo() {
  const comentarios = [{ id: 'c1', conteudo: 'oi', usuario: { id: 1 } }]
  return {
    comentarios,
    findById: async (id) => comentarios.find((c) => c.id === id) ?? null,
    delete: async (id) => {
      const i = comentarios.findIndex((c) => c.id === id)
      if (i === -1) return false
      comentarios.splice(i, 1)
      return true
    },
  }
}

describe('DeleteComentarioUseCase', () => {
  it('permite ao autor excluir o próprio comentário', async () => {
    const repo = makeRepo()
    await new DeleteComentarioUseCase(repo).handler('c1', {
      id: 1,
      tipo: TipoUsuario.ALUNO,
    })
    expect(repo.comentarios).toHaveLength(0)
  })

  it.each([TipoUsuario.PROFESSOR, TipoUsuario.ADMINISTRADOR])(
    'permite a %s excluir comentário de terceiros',
    async (tipo) => {
      const repo = makeRepo()
      await new DeleteComentarioUseCase(repo).handler('c1', { id: 99, tipo })
      expect(repo.comentarios).toHaveLength(0)
    },
  )

  it('nega a Aluno excluir comentário de outro usuário', async () => {
    const repo = makeRepo()
    await expect(
      new DeleteComentarioUseCase(repo).handler('c1', {
        id: 2,
        tipo: TipoUsuario.ALUNO,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError)
    expect(repo.comentarios).toHaveLength(1)
  })

  it('lança ResourceNotFoundError quando o comentário não existe', async () => {
    await expect(
      new DeleteComentarioUseCase(makeRepo()).handler('x', {
        id: 1,
        tipo: TipoUsuario.ADMINISTRADOR,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
