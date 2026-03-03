import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { WeekDay } from '../generated/prisma/enums.js'
import { auth } from '../lib/auth.js'
import { errorSchema } from '../schemas/index.js'
import { CreateWorkoutPlan } from '../use-cases/create-workout-plan.js'

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
}
