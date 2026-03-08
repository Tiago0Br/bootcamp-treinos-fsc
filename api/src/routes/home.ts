import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { auth } from '../lib/auth.js'
import { errorSchema } from '../schemas/index.js'
import { GetHomeData } from '../use-cases/get-home-data.js'

export function homeRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:date',
    {
      schema: {
        operationId: 'getHomeData',
        tags: ['Home'],
        summary: 'Get home page data for a specific date',
        params: z.object({
          date: z.iso.date()
        }),
        response: {
          200: z.object({
            activeWorkoutPlanId: z.uuid(),
            todayWorkoutDay: z.object({
              workoutPlanId: z.uuid(),
              id: z.uuid(),
              name: z.string(),
              isRest: z.boolean(),
              weekDay: z.string(),
              estimatedDurationInSeconds: z.number(),
              coverImageUrl: z.url().optional(),
              exercisesCount: z.number()
            }),
            workoutStreak: z.number(),
            consistencyByDay: z.record(
              z.string(),
              z.object({
                workoutDayCompleted: z.boolean(),
                workoutDayStarted: z.boolean()
              })
            )
          }),
          401: errorSchema,
          404: errorSchema,
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

      const { date } = request.params

      const getHomeData = new GetHomeData()
      const result = await getHomeData.execute({
        userId: session.user.id,
        date
      })

      return reply.status(200).send(result)
    }
  )
}
