import { env } from './env'
import { app } from './app'
import { initializeDataSource } from './lib/typeorm/typeorm'

async function bootstrap() {
  await initializeDataSource()

  await app.listen({
    host: '0.0.0.0',
    port: env.PORT,
  })

  console.log('Server is running on http://localhost:' + env.PORT)
}

bootstrap().catch((error) => {
  console.error('Error during application startup', error)
  process.exit(1)
})
