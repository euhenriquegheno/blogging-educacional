const fastify = require('fastify')
const fastifyJwt = require('@fastify/jwt')
const bcrypt = require('bcrypt')
const { TipoUsuario } = require('../build/entities/models/tipo-usuario.enum')
const {
  globalErrorHandler,
} = require('../build/utils/global-error-handler')

class InMemoryUsuarioRepository {
  usuarios = []

  async findByEmail(email) {
    return this.usuarios.find((usuario) => usuario.email === email) ?? null
  }
}

const mockRepository = new InMemoryUsuarioRepository()

jest.mock('../build/uses-cases/factory/make-authenticate-use-case', () => {
  const {
    AuthenticateUseCase,
    // eslint-disable-next-line global-require
  } = require('../build/uses-cases/authenticate')

  return {
    makeAuthenticateUseCase: () => new AuthenticateUseCase(mockRepository),
  }
})

const { login } = require('../build/http/controllers/auth/login')

function buildApp() {
  const app = fastify()

  app.register(fastifyJwt, { secret: 'test-secret' })

  app.post('/login', login)

  app.setErrorHandler(globalErrorHandler)

  return app
}

async function makeUsuario(overrides = {}) {
  const senhaHash = await bcrypt.hash('senha-correta', 8)

  return {
    id: 1,
    email: 'professor@example.com',
    senha: senhaHash,
    nome: 'Professor Teste',
    cpf: '12345678900',
    tipo: TipoUsuario.PROFESSOR,
    ...overrides,
  }
}

describe('POST /login', () => {
  beforeEach(() => {
    mockRepository.usuarios = []
  })

  it('retorna 200 e um token JWT válido por 24 horas para credenciais corretas', async () => {
    const app = buildApp()
    await app.ready()
    const usuario = await makeUsuario()
    mockRepository.usuarios.push(usuario)

    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'professor@example.com',
        senha: 'senha-correta',
      },
    })

    expect(response.statusCode).toBe(200)

    const { token } = response.json()
    expect(typeof token).toBe('string')

    const decoded = app.jwt.decode(token)
    expect(decoded.sub).toBe(usuario.id)
    expect(decoded.tipo).toBe(usuario.tipo)
    expect(decoded.exp - decoded.iat).toBe(24 * 60 * 60)

    await app.close()
  })

  it('retorna 401 com a mensagem padrão para credenciais inválidas', async () => {
    const app = buildApp()
    await app.ready()

    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'nao-existe@example.com',
        senha: 'qualquer-senha',
      },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({
      message: 'Username or password is incorrect',
    })

    await app.close()
  })
})
