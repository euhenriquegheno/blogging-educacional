const fastify = require('fastify')
const fastifyJwt = require('@fastify/jwt')
const { verifyJwt } = require('../build/http/middlewares/verify-jwt')
const {
  verifyUserType,
} = require('../build/http/middlewares/verify-user-type')
const { TipoUsuario } = require('../build/entities/models/tipo-usuario.enum')

function buildApp() {
  const app = fastify()

  app.register(fastifyJwt, { secret: 'test-secret' })

  app.get('/protected', { preHandler: [verifyJwt] }, async () => {
    return { ok: true }
  })

  app.get(
    '/admin-only',
    {
      preHandler: [
        verifyJwt,
        verifyUserType([TipoUsuario.ADMINISTRADOR]),
      ],
    },
    async () => {
      return { ok: true }
    },
  )

  return app
}

describe('verifyJwt middleware', () => {
  it('returns 401 when the Authorization header is missing', async () => {
    const app = buildApp()

    const response = await app.inject({
      method: 'GET',
      url: '/protected',
    })

    expect(response.statusCode).toBe(401)
  })

  it('returns 401 when the token is invalid', async () => {
    const app = buildApp()

    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: {
        authorization: 'Bearer invalid-token',
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('allows the request through when the token is valid', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 1, tipo: TipoUsuario.ALUNO })

    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
  })
})

describe('verifyUserType middleware', () => {
  it('returns 403 when the ALUNO tries to access an ADMINISTRADOR-only route', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 1, tipo: TipoUsuario.ALUNO })

    const response = await app.inject({
      method: 'GET',
      url: '/admin-only',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(403)
  })

  it('allows the ADMINISTRADOR to access an ADMINISTRADOR-only route', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 1, tipo: TipoUsuario.ADMINISTRADOR })

    const response = await app.inject({
      method: 'GET',
      url: '/admin-only',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
  })
})
