const fastify = require('fastify')
const fastifyJwt = require('@fastify/jwt')

class InMemoryComentarioRepository {
  comentarios = []

  async create(comentario) {
    this.comentarios.push(comentario)
    return comentario
  }

  async findAllByPublicacaoId(publicacaoId, page, limit) {
    return this.comentarios
      .filter((comentario) => comentario.publicacao.id === publicacaoId)
      .slice((page - 1) * limit, (page - 1) * limit + limit)
  }

  async delete(id) {
    const index = this.comentarios.findIndex(
      (comentario) => comentario.id === id,
    )

    if (index === -1) {
      return false
    }

    this.comentarios.splice(index, 1)
    return true
  }
}

const mockRepository = new InMemoryComentarioRepository()

jest.mock('../build/uses-cases/factory/make-create-comentario-use-case', () => {
  // eslint-disable-next-line global-require
  const { CreateComentarioUseCase } = require('../build/uses-cases/create-comentario')

  return {
    makeCreateComentarioUseCase: () =>
      new CreateComentarioUseCase(mockRepository),
  }
})

jest.mock('../build/uses-cases/factory/make-find-all-comentario-use-case', () => {
  // eslint-disable-next-line global-require
  const { FindAllComentarioUseCase } = require('../build/uses-cases/find-all-comentario')

  return {
    makeFindAllComentarioUseCase: () =>
      new FindAllComentarioUseCase(mockRepository),
  }
})

// eslint-disable-next-line global-require
const { comentarioRoutes } = require('../build/http/controllers/comentario/routes')

function buildApp() {
  const app = fastify()

  app.register(fastifyJwt, { secret: 'test-secret' })
  app.register(comentarioRoutes)

  return app
}

describe('Rotas de comentarios', () => {
  const publicacaoId = '00000000-0000-0000-0000-000000000000'

  it('bloqueia POST /posts/:id/comments sem token com 401', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({
      method: 'POST',
      url: `/posts/${publicacaoId}/comments`,
      payload: { conteudo: 'Tentativa sem autenticacao' },
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it('permite GET /posts/:id/comments sem token e retorna 200 com a lista de comentarios', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({
      method: 'GET',
      url: `/posts/${publicacaoId}/comments`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([])

    await app.close()
  })
})
