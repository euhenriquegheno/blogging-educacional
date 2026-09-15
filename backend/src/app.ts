import fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { usuarioRoutes } from './http/controllers/usuario/routes'
import { publicacaoRoutes } from './http/controllers/publicacao/routes'
import { authRoutes } from './http/controllers/auth/routes'
import { comentarioRoutes } from './http/controllers/comentario/routes'
import { globalErrorHandler } from './utils/global-error-handler'
import { env } from './env'

export const app = fastify()

app.register(cors, {
  origin: true,
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(swagger, {
  openapi: {
    info: {
      title: 'API Blogging',
      description: 'API REST para uma plataforma educacional de publicações.',
      version: '1.0.0',
    },
    tags: [
      { name: 'Posts', description: 'Operações com postagens' },
      { name: 'Usuários', description: 'Operações com docentes e usuários' },
      { name: 'Autenticação', description: 'Login e emissão de tokens JWT' },
      { name: 'Comentários', description: 'Operações com comentários em postagens' },
    ],
  },
})

app.register(usuarioRoutes)
app.register(publicacaoRoutes)
app.register(authRoutes)
app.register(comentarioRoutes)

app.register(swaggerUi, {
  routePrefix: '/docs',
})

app.setErrorHandler(globalErrorHandler)
