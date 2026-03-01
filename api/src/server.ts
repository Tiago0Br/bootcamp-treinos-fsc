import fastify from 'fastify'
import { env } from './env.js'

const app = fastify({
  logger: true
})

app.get('/', () => {
  return { hello: 'world' }
})

try {
  await app.listen({ port: env.PORT })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
