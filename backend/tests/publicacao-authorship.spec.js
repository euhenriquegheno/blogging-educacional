const fastify = require('fastify')
const fastifyJwt = require('@fastify/jwt')
const { TipoUsuario } = require('../build/entities/models/tipo-usuario.enum')
const {
  globalErrorHandler,
} = require('../build/utils/global-error-handler')

class InMemoryPublicacaoRepository {
  publicacoes = []

  async findAll() {
    return this.publicacoes
  }

  async search() {
    return this.publicacoes
  }

  async findById(id) {
    return this.publicacoes.find((publicacao) => publicacao.id === id) ?? null
  }

  async create(publicacao) {
    const created = { ...publicacao, id: `post-${this.publicacoes.length + 1}` }
    this.publicacoes.push(created)
    return created
  }

  async update(publicacao) {
    const index = this.publicacoes.findIndex(
      (item) => item.id === publicacao.id,
    )
    this.publicacoes[index] = publicacao
    return publicacao
  }

  async delete(id) {
    const index = this.publicacoes.findIndex(
      (publicacao) => publicacao.id === id,
    )

    if (index === -1) {
      return false
    }

    this.publicacoes.splice(index, 1)
    return true
  }
}

const mockRepository = new InMemoryPublicacaoRepository()

jest.mock('../build/uses-cases/factory/make-create-publicacao-use-case', () => {
  const {
    CreatePublicacaoUseCase,
    // eslint-disable-next-line global-require
  } = require('../build/uses-cases/create-publicacao')

  return {
    makeCreatePublicacaoUseCase: () =>
      new CreatePublicacaoUseCase(mockRepository),
  }
})

jest.mock('../build/uses-cases/factory/make-update-publicacao-use-case', () => {
  const {
    UpdatePublicacaoUseCase,
    // eslint-disable-next-line global-require
  } = require('../build/uses-cases/update-publicacao')

  return {
    makeUpdatePublicacaoUseCase: () =>
      new UpdatePublicacaoUseCase(mockRepository),
  }
})

const { create } = require('../build/http/controllers/publicacao/create')
const { update } = require('../build/http/controllers/publicacao/update')
const { verifyJwt } = require('../build/http/middlewares/verify-jwt')

function buildApp() {
  const app = fastify()

  app.register(fastifyJwt, { secret: 'test-secret' })

  app.post('/posts', { preHandler: [verifyJwt] }, create)
  app.put('/posts/:id', { preHandler: [verifyJwt] }, update)

  app.setErrorHandler(globalErrorHandler)

  return app
}

describe('Autoria de publicacao via controllers', () => {
  beforeEach(() => {
    mockRepository.publicacoes = []
  })

  it('cria um post com usuario.id igual ao usuário logado, ignorando usuario_id do corpo', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 1, tipo: TipoUsuario.PROFESSOR })

    const response = await app.inject({
      method: 'POST',
      url: '/posts',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        titulo: 'Título',
        conteudo: 'Conteúdo',
        usuario_id: 999,
      },
    })

    expect(response.statusCode).toBe(201)
    const publicacao = response.json()
    expect(publicacao.usuario.id).toBe(1)
    expect(publicacao.usuario.id).not.toBe(999)

    await app.close()
  })

  it('não altera o usuario original ao editar um post, mesmo enviando usuario_id diferente no corpo', async () => {
    const app = buildApp()
    await app.ready()
    const postId = '11111111-1111-4111-8111-111111111111'
    mockRepository.publicacoes.push({
      id: postId,
      titulo: 'Título original',
      conteudo: 'Conteúdo original',
      usuario: { id: 1 },
    })
    const token = app.jwt.sign({ sub: 1, tipo: TipoUsuario.PROFESSOR })

    const response = await app.inject({
      method: 'PUT',
      url: `/posts/${postId}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        titulo: 'Título editado',
        conteudo: 'Conteúdo editado',
        usuario_id: 999,
      },
    })

    expect(response.statusCode).toBe(200)
    const publicacao = response.json()
    expect(publicacao.usuario.id).toBe(1)
    expect(publicacao.usuario.id).not.toBe(999)

    await app.close()
  })
})
