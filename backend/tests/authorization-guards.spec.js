const fastify = require('fastify')
const fastifyJwt = require('@fastify/jwt')
const { publicacaoRoutes } = require('../build/http/controllers/publicacao/routes')
const { usuarioRoutes } = require('../build/http/controllers/usuario/routes')
const { TipoUsuario } = require('../build/entities/models/tipo-usuario.enum')

function buildApp() {
  const app = fastify()

  app.register(fastifyJwt, { secret: 'test-secret' })
  app.register(publicacaoRoutes)
  app.register(usuarioRoutes)

  return app
}

describe('Guardas de autorização - rotas de publicacao', () => {
  it('bloqueia POST /posts sem token com 401', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({
      method: 'POST',
      url: '/posts',
      payload: { titulo: 'T', conteudo: 'C', usuario_id: 1 },
    })

    expect(response.statusCode).toBe(401)
  })

  it('bloqueia POST /posts de um ALUNO autenticado com 403', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 1, tipo: TipoUsuario.ALUNO })

    const response = await app.inject({
      method: 'POST',
      url: '/posts',
      headers: { authorization: `Bearer ${token}` },
      payload: { titulo: 'T', conteudo: 'C', usuario_id: 1 },
    })

    expect(response.statusCode).toBe(403)
  })

  it('bloqueia PUT /posts/:id sem token com 401', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({
      method: 'PUT',
      url: '/posts/00000000-0000-0000-0000-000000000000',
      payload: { titulo: 'T', conteudo: 'C', usuario_id: 1 },
    })

    expect(response.statusCode).toBe(401)
  })

  it('bloqueia DELETE /posts/:id sem token com 401', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({
      method: 'DELETE',
      url: '/posts/00000000-0000-0000-0000-000000000000',
    })

    expect(response.statusCode).toBe(401)
  })

  it('não bloqueia GET /posts sem token (rota pública)', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({
      method: 'GET',
      url: '/posts',
    })

    expect(response.statusCode).not.toBe(401)
    expect(response.statusCode).not.toBe(403)
  })

  it('não bloqueia GET /posts/:id sem token (rota pública)', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({
      method: 'GET',
      url: '/posts/00000000-0000-0000-0000-000000000000',
    })

    expect(response.statusCode).not.toBe(401)
    expect(response.statusCode).not.toBe(403)
  })

  it('permite POST /posts para um PROFESSOR autenticado passar da guarda de autorização', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 1, tipo: TipoUsuario.PROFESSOR })

    const response = await app.inject({
      method: 'POST',
      url: '/posts',
      headers: { authorization: `Bearer ${token}` },
      payload: { titulo: 'T', conteudo: 'C', usuario_id: 1 },
    })

    expect(response.statusCode).not.toBe(401)
    expect(response.statusCode).not.toBe(403)
  })
})

describe('Guardas de autorização - rotas de usuario', () => {
  it('bloqueia POST /user sem token com 401', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        email: 'a@a.com',
        senha: '123456',
        nome: 'A',
        cpf: '12345678900',
        tipo: TipoUsuario.PROFESSOR,
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('bloqueia GET /user sem token com 401', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({ method: 'GET', url: '/user' })

    expect(response.statusCode).toBe(401)
  })

  it('bloqueia GET /user/:id sem token com 401', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({ method: 'GET', url: '/user/1' })

    expect(response.statusCode).toBe(401)
  })

  it('bloqueia PUT /user/:id sem token com 401', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({
      method: 'PUT',
      url: '/user/1',
      payload: {
        email: 'a@a.com',
        senha: '123456',
        nome: 'A',
        cpf: '12345678900',
        tipo: TipoUsuario.PROFESSOR,
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('bloqueia DELETE /user/:id sem token com 401', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({ method: 'DELETE', url: '/user/1' })

    expect(response.statusCode).toBe(401)
  })

  it('bloqueia todas as rotas de usuario para um PROFESSOR autenticado com 403', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 1, tipo: TipoUsuario.PROFESSOR })

    const response = await app.inject({
      method: 'GET',
      url: '/user',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(403)
  })

  it('permite um ADMINISTRADOR autenticado passar da guarda de autorização em /user', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 1, tipo: TipoUsuario.ADMINISTRADOR })

    const response = await app.inject({
      method: 'GET',
      url: '/user',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).not.toBe(401)
    expect(response.statusCode).not.toBe(403)
  })
})
