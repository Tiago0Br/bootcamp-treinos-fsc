import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from 'fastify-type-provider-zod'
import { z } from 'zod'
import { env } from './env.js'
import { auth } from './lib/auth.js'

const app = fastify({
  logger: true
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Bootcamp Treinos API',
      description: 'API para o bootcamp de treinos do FSC',
      version: '1.0.0'
    },
    servers: [
      {
        description: 'Local',
        url: `http://localhost:${env.PORT}`
      }
    ]
  },
  transform: jsonSchemaTransform
})

await app.register(fastifySwaggerUI, {
  routePrefix: '/docs'
})

await app.register(fastifyCors, {
  origin: [env.FRONTEND_URL],
  credentials: true
})

app.withTypeProvider<ZodTypeProvider>().route({
  method: 'GET',
  url: '/',
  schema: {
    description: 'Verify if API is running',
    tags: ['health'],
    response: {
      200: z.object({
        message: z.string()
      })
    }
  },
  handler: () => {
    return {
      message: 'API is running!'
    }
  }
})

app.route({
  method: ['GET', 'POST'],
  url: '/api/auth/*',
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`)

      // Convert Fastify headers to standard Headers object
      const headers = new Headers()
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString())
      })
      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {})
      })
      // Process authentication request
      const response = await auth.handler(req)
      // Forward response to client
      reply.status(response.status)
      response.headers.forEach((value, key) => {
        reply.header(key, value)
      })
      reply.send(response.body ? await response.text() : null)
    } catch {
      app.log.error('Authentication Error')
      reply.status(500).send({
        error: 'Internal authentication error',
        code: 'AUTH_FAILURE'
      })
    }
  }
})

try {
  await app.listen({ port: env.PORT })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
