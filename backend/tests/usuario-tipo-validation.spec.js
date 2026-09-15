const fastify = require('fastify')
const { usuarioBodySchema } = require('../build/http/swagger-schemas')
const { TipoUsuario } = require('../build/entities/models/tipo-usuario.enum')

function buildApp() {
  const app = fastify()

  app.post(
    '/user',
    { schema: { body: usuarioBodySchema } },
    async (request, reply) => {
      return reply.status(201).send({ ok: true })
    },
  )

  return app
}

describe('POST /user - validação do campo tipo via usuarioBodySchema', () => {
  it('expõe apenas os valores numéricos do enum TipoUsuario no schema (sem reverse-mapping do zod)', () => {
    expect(usuarioBodySchema.properties.tipo.enum).toEqual([
      TipoUsuario.ADMINISTRADOR,
      TipoUsuario.PROFESSOR,
      TipoUsuario.ALUNO,
    ])
    usuarioBodySchema.properties.tipo.enum.forEach((valor) => {
      expect(typeof valor).toBe('number')
    })
  })

  it('retorna 400 quando tipo está fora dos valores do enum TipoUsuario', async () => {
    const app = buildApp()

    const response = await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        email: 'usuario@teste.com',
        senha: 'senha123',
        nome: 'Usuário Teste',
        cpf: '12345678900',
        tipo: 99,
      },
    })

    expect(response.statusCode).toBe(400)

    await app.close()
  })

  it('aceita quando tipo é um valor válido do enum TipoUsuario', async () => {
    const app = buildApp()

    const response = await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        email: 'usuario@teste.com',
        senha: 'senha123',
        nome: 'Usuário Teste',
        cpf: '12345678900',
        tipo: 2,
      },
    })

    expect(response.statusCode).toBe(201)

    await app.close()
  })
})
