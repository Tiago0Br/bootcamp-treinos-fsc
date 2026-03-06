import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { WeekDay } from '../generated/prisma/enums.js'
import { auth } from '../lib/auth.js'
import { errorSchema } from '../schemas/index.js'
import { CreateWorkoutPlan } from '../use-cases/create-workout-plan.js'
import { StartWorkoutSession } from '../use-cases/start-workout-session.js'

export function workoutPlanRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '',
    {
      schema: {
        body: z.object({
          name: z.string().trim().min(1),
          workoutDays: z.array(
            z.object({
              name: z.string().trim().min(1),
              weekDay: z.enum(WeekDay),
              isRest: z.boolean().default(false),
              estimatedDurationInSeconds: z.number().min(1),
              coverImageUrl: z.url().optional(),
              exercices: z.array(
                z.object({
                  name: z.string().trim().min(1),
                  order: z.number().min(0),
                  sets: z.number().min(1),
                  reps: z.number().min(1),
                  restTimeInSeconds: z.number().min(1)
                })
              )
            })
          )
        }),
        response: {
          201: z.object({
            workoutPlanId: z.uuid()
          }),
          400: errorSchema,
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

      const { name, workoutDays } = request.body

      const createWorkoutPlan = new CreateWorkoutPlan()
      const { workoutPlanId } = await createWorkoutPlan.execute({
        userId: session.user.id,
        name,
        workoutDays
      })

      return reply.status(201).send({
        workoutPlanId
      })
    }
  )

  app.withTypeProvider<ZodTypeProvider>().post(
    '/:workoutPlanId/days/:workoutDayId/sessions',
    {
      schema: {
        tags: ['Workout Session'],
        summary: 'Start a workout session for a workout day',
        params: z.object({
          workoutPlanId: z.uuid(),
          workoutDayId: z.uuid()
        }),
        response: {
          201: z.object({
            userWorkoutSessionId: z.uuid()
          }),
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
          409: errorSchema,
          422: errorSchema,
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

      const { workoutPlanId, workoutDayId } = request.params

      const startWorkoutSession = new StartWorkoutSession()
      const result = await startWorkoutSession.execute({
        userId: session.user.id,
        workoutPlanId,
        workoutDayId
      })

      return reply.status(201).send(result)
    }
  )
}
