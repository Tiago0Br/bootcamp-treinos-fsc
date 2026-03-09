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
import { env } from './env.js'
import { errorHandler } from './lib/error-handler.js'
import { aiRoutes } from './routes/ai.js'
import { authRoutes } from './routes/auth.js'
import { healthCheckRoute } from './routes/health.js'
import { homeRoutes } from './routes/home.js'
import { statsRoutes } from './routes/stats.js'
import { usersRoutes } from './routes/users.js'
import { workoutPlanRoutes } from './routes/workout-plan.js'

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  },
  production: true,
  test: false
}

const app = fastify({
  logger: envToLogger[env.NODE_ENV]
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
        url: env.API_URL
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

// Routes
await app.register(healthCheckRoute, { prefix: '/' })
await app.register(homeRoutes, { prefix: '/home' })
await app.register(usersRoutes, { prefix: '/me' })
await app.register(statsRoutes, { prefix: '/stats' })
await app.register(workoutPlanRoutes, { prefix: '/workout-plans' })
await app.register(aiRoutes, { prefix: '/ai' })

app.withTypeProvider<ZodTypeProvider>().get(
  '/swagger.json',
  {
    schema: {
      hide: true
    }
  },
  async () => {
    return app.swagger()
  }
)

app.register(authRoutes)

try {
  await app.listen({ port: env.PORT })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
