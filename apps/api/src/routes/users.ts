import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { auth } from '../lib/auth.js'
import { errorSchema } from '../schemas/index.js'
import { GetUserTrainData } from '../use-cases/get-user-train-data.js'
import { UpsertUserTrainData } from '../use-cases/upsert-user-train-data.js'

const userTrainDataSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  weightInGrams: z.number(),
  heightInCentimeters: z.number(),
  age: z.number(),
  bodyFatPercentage: z.number()
})

export function usersRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '',
    {
      schema: {
        operationId: 'getUserTrainData',
        tags: ['Users'],
        summary: 'Get current user train data',
        response: {
          200: userTrainDataSchema.nullable(),
          401: errorSchema,
          500: errorSchema
        }
      }
    },
    async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers)
      })

      if (!session) {
        return reply.status(401).send({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED'
        })
      }

      const getUserTrainData = new GetUserTrainData()
      const result = await getUserTrainData.execute({ userId: session.user.id })

      return reply.status(200).send(result)
    }
  )

  app.withTypeProvider<ZodTypeProvider>().put(
    '/me',
    {
      schema: {
        operationId: 'createOrUpdateUserTrainData',
        tags: ['Users'],
        summary: 'Create or update current user train data',
        body: z.object({
          weightInGrams: z.number().min(1),
          heightInCentimeters: z.number().min(1),
          age: z.number().min(1),
          bodyFatPercentage: z.number().min(0).max(1)
        }),
        response: {
          200: userTrainDataSchema,
          401: errorSchema,
          500: errorSchema
        }
      }
    },
    async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers)
      })

      if (!session) {
        return reply.status(401).send({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED'
        })
      }

      const upsertUserTrainData = new UpsertUserTrainData()
      const result = await upsertUserTrainData.execute({
        userId: session.user.id,
        ...request.body
      })

      return reply.status(200).send({
        ...result,
        userName: session.user.name
      })
    }
  )
}
