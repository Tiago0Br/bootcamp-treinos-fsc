import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifyApiReference from '@scalar/fastify-api-reference'
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
import { errorHandler } from './lib/error-handler.js'
import { workoutPlanRoutes } from './routes/workout-plan.js'

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

await app.register(fastifyCors, {
  origin: [env.FRONTEND_URL],
  credentials: true
})

await app.register(fastifyApiReference, {
  routePrefix: '/docs',
  configuration: {
    sources: [
      {
        title: 'Bootcamp Treinos API',
        slug: 'bootcamp-treinos-api',
        url: '/swagger.json'
      },
      {
        title: 'Auth API',
        slug: 'auth-api',
        url: '/api/auth/open-api/generate-schema'
      }
    ]
  }
})

app.setErrorHandler(errorHandler)

await app.register(workoutPlanRoutes, { prefix: '/workout-plans' })

app.withTypeProvider<ZodTypeProvider>().route({
  method: 'GET',
  url: '/swagger.json',
  schema: {
    hide: true
  },
  handler: async () => {
    return app.swagger()
  }
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
      const url = new URL(request.url, `http://${request.headers.host}`)
      const headers = new Headers()
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString())
      })
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {})
      })
      const response = await auth.handler(req)
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
