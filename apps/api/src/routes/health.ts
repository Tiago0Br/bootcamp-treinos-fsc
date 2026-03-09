import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function healthCheckRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '',
    {
      schema: {
        summary: 'Health Check',
        description: 'Verify if API is running',
        tags: ['health'],
        response: {
          200: z.object({
            message: z.string()
          })
        }
      }
    },
    () => {
      return {
        message: 'API is running!'
      }
    }
  )
}
