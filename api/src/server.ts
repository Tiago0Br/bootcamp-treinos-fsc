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

try {
  await app.listen({ port: env.PORT })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
