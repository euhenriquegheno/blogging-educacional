const fastify = require('fastify')
const fastifyJwt = require('@fastify/jwt')
const {
  CreateComentarioUseCase,
} = require('../build/uses-cases/create-comentario')
const {
  FindAllComentarioUseCase,
} = require('../build/uses-cases/find-all-comentario')
const {
  globalErrorHandler,
} = require('../build/utils/global-error-handler')

class InMemoryComentarioRepository {
  comentarios = []

  async create(comentario) {
    this.comentarios.push(comentario)
    return comentario
  }

  async findAllByPublicacaoId(publicacaoId, page, limit) {
    return this.comentarios
      .filter((comentario) => comentario.publicacao.id === publicacaoId)
      .sort((a, b) => a.criadoEm - b.criadoEm)
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

const usuario = { id: 1 }
const publicacao = { id: 'post-1' }
const outraPublicacao = { id: 'post-2' }

function makeComentario(overrides = {}) {
  return {
    conteudo: 'Comentário de teste',
    usuario,
    publicacao,
    ...overrides,
  }
}

describe('CreateComentarioUseCase', () => {
  it('returns the created comentario associated with the given usuario and publicacao', async () => {
    const repository = new InMemoryComentarioRepository()
    const useCase = new CreateComentarioUseCase(repository)
    const comentario = makeComentario()

    const created = await useCase.handler(comentario)

    expect(created).toEqual(comentario)
    expect(created.usuario).toEqual(usuario)
    expect(created.publicacao).toEqual(publicacao)
    expect(repository.comentarios).toContainEqual(comentario)
  })
})

describe('POST /posts/:id/comments', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = new InMemoryComentarioRepository()
  })

  function buildApp() {
    jest.resetModules()
    jest.doMock(
      '../build/uses-cases/factory/make-create-comentario-use-case',
      () => ({
        makeCreateComentarioUseCase: () =>
          new CreateComentarioUseCase(mockRepository),
      }),
    )

    // eslint-disable-next-line global-require
    const { create } = require('../build/http/controllers/comentario/create')
    // eslint-disable-next-line global-require
    const {
      verifyJwt,
      // eslint-disable-next-line global-require
    } = require('../build/http/middlewares/verify-jwt')

    const app = fastify()

    app.register(fastifyJwt, { secret: 'test-secret' })

    app.post(
      '/posts/:id/comments',
      { preHandler: [verifyJwt] },
      create,
    )

    app.setErrorHandler(globalErrorHandler)

    return app
  }

  it('creates a comentario for the authenticated user and returns 201', async () => {
    const app = buildApp()
    await app.ready()

    const token = app.jwt.sign({ sub: 1, tipo: 3 })

    const response = await app.inject({
      method: 'POST',
      url: '/posts/post-1/comments',
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        conteudo: 'Muito bom esse post!',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      conteudo: 'Muito bom esse post!',
      usuario: { id: 1 },
      publicacao: { id: 'post-1' },
    })

    await app.close()
  })

  it('returns 400 when conteudo is an empty string', async () => {
    const app = buildApp()
    await app.ready()

    const token = app.jwt.sign({ sub: 1, tipo: 3 })

    const response = await app.inject({
      method: 'POST',
      url: '/posts/post-1/comments',
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        conteudo: '',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(mockRepository.comentarios).toHaveLength(0)

    await app.close()
  })

  it('returns 401 when there is no valid token', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({
      method: 'POST',
      url: '/posts/post-1/comments',
      payload: {
        conteudo: 'Comentário sem autenticação',
      },
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })
})

describe('FindAllComentarioUseCase', () => {
  it('returns only the comments from the given publicacaoId, ordered by criadoEm', async () => {
    const repository = new InMemoryComentarioRepository()
    const useCase = new FindAllComentarioUseCase(repository)

    const maisRecente = makeComentario({
      id: 'comentario-2',
      conteudo: 'Comentário mais recente',
      criadoEm: new Date('2024-01-02T10:00:00Z'),
    })
    const maisAntigo = makeComentario({
      id: 'comentario-1',
      conteudo: 'Comentário mais antigo',
      criadoEm: new Date('2024-01-01T10:00:00Z'),
    })
    const deOutraPublicacao = makeComentario({
      id: 'comentario-3',
      conteudo: 'Comentário de outra publicação',
      publicacao: outraPublicacao,
      criadoEm: new Date('2024-01-01T09:00:00Z'),
    })

    repository.comentarios.push(maisRecente, maisAntigo, deOutraPublicacao)

    const comentarios = await useCase.handler(publicacao.id, 1, 10)

    expect(comentarios).toHaveLength(2)
    expect(comentarios.map((comentario) => comentario.id)).toEqual([
      'comentario-1',
      'comentario-2',
    ])
  })

  it('returns an empty array for a publication without comments', async () => {
    const repository = new InMemoryComentarioRepository()
    const useCase = new FindAllComentarioUseCase(repository)

    const comentarios = await useCase.handler('post-sem-comentarios', 1, 10)

    expect(comentarios).toEqual([])
  })
})

describe('GET /posts/:id/comments', () => {
  it('returns 200 with the list of comments when there is no token', async () => {
    jest.resetModules()
    const mockRepository = new InMemoryComentarioRepository()
    jest.doMock(
      '../build/uses-cases/factory/make-find-all-comentario-use-case',
      () => ({
        makeFindAllComentarioUseCase: () =>
          new FindAllComentarioUseCase(mockRepository),
      }),
    )

    mockRepository.comentarios.push(
      makeComentario({
        id: 'comentario-1',
        conteudo: 'Comentário visível sem autenticação',
      }),
      makeComentario({
        id: 'comentario-2',
        conteudo: 'Outro comentário público',
      }),
    )

    // eslint-disable-next-line global-require
    const {
      findAllComentario,
      // eslint-disable-next-line global-require
    } = require('../build/http/controllers/comentario/find-all')

    const app = fastify()
    app.get('/posts/:id/comments', findAllComentario)
    app.setErrorHandler(globalErrorHandler)
    await app.ready()

    const response = await app.inject({
      method: 'GET',
      url: '/posts/post-1/comments',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveLength(2)
    expect(response.json().map((c) => c.id)).toEqual([
      'comentario-1',
      'comentario-2',
    ])

    await app.close()
  })
})
