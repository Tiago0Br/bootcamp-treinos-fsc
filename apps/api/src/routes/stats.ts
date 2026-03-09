import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { auth } from '../lib/auth.js'
import { errorSchema } from '../schemas/index.js'
import { GetStats } from '../use-cases/get-stats.js'

export function statsRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '',
    {
      schema: {
        operationId: 'getWorkoutStats',
        tags: ['Stats'],
        summary: 'Get workout stats for a date range',
        querystring: z.object({
          from: z.iso.date(),
          to: z.iso.date()
        }),
        response: {
          200: z.object({
            workoutStreak: z.number(),
            consistencyByDay: z.record(
              z.string(),
              z.object({
                workoutDayCompleted: z.boolean(),
                workoutDayStarted: z.boolean()
              })
            ),
            completedWorkoutsCount: z.number(),
            conclusionRate: z.number(),
            totalTimeInSeconds: z.number()
          }),
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

      const { from, to } = request.query

      const getStats = new GetStats()
      const result = await getStats.execute({
        userId: session.user.id,
        from,
        to
      })

      return reply.status(200).send(result)
    }
  )
}
