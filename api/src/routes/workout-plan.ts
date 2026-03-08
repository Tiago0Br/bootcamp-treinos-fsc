import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { WeekDay } from '../generated/prisma/enums.js'
import { auth } from '../lib/auth.js'
import {
  errorSchema,
  listWorkoutPlansQuerySchema,
  listWorkoutPlansSchema
} from '../schemas/index.js'
import { CompleteWorkoutSession } from '../use-cases/complete-workout-session.js'
import { CreateWorkoutPlan } from '../use-cases/create-workout-plan.js'
import { GetWorkoutDay } from '../use-cases/get-workout-day.js'
import { GetWorkoutPlan } from '../use-cases/get-workout-plan.js'
import { ListWorkoutPlans } from '../use-cases/list-workout-plans.js'
import { StartWorkoutSession } from '../use-cases/start-workout-session.js'

export function workoutPlanRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      operationId: 'listWorkoutPlans',
      tags: ['Workout Plan'],
      summary: 'List workout plans',
      querystring: listWorkoutPlansQuerySchema,
      response: {
        200: listWorkoutPlansSchema,
        401: errorSchema,
        500: errorSchema
      }
    },
    handler: async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers)
      })
      if (!session) {
        return reply.status(401).send({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED'
        })
      }

      const listWorkoutPlans = new ListWorkoutPlans()
      const result = await listWorkoutPlans.execute({
        userId: session.user.id,
        active: request.query.active
      })

      return reply.status(200).send(result)
    }
  })

  app.withTypeProvider<ZodTypeProvider>().post(
    '',
    {
      schema: {
        operationId: 'createWorkoutPlans',
        tags: ['Workout Plan'],
        summary: 'Create a new workout plan',
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

  app.withTypeProvider<ZodTypeProvider>().get(
    '/:id',
    {
      schema: {
        operationId: 'getWorkoutPlanById',
        tags: ['Workout Plan'],
        summary: 'Get a workout plan by id',
        params: z.object({
          id: z.uuid()
        }),
        response: {
          200: z.object({
            id: z.uuid(),
            name: z.string(),
            workoutDays: z.array(
              z.object({
                id: z.uuid(),
                weekDay: z.enum(WeekDay),
                name: z.string(),
                isRest: z.boolean(),
                coverImageUrl: z.url().optional(),
                estimatedDurationInSeconds: z.number(),
                exercisesCount: z.number()
              })
            )
          }),
          401: errorSchema,
          403: errorSchema,
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

      const { id } = request.params

      const getWorkoutPlan = new GetWorkoutPlan()
      const result = await getWorkoutPlan.execute({
        userId: session.user.id,
        workoutPlanId: id
      })

      return reply.status(200).send(result)
    }
  )

  app.withTypeProvider<ZodTypeProvider>().get(
    '/:workoutPlanId/days/:workoutDayId',
    {
      schema: {
        operationId: 'getWorkoutDayById',
        tags: ['Workout Plan'],
        summary: 'Get a workout day by id',
        params: z.object({
          workoutPlanId: z.uuid(),
          workoutDayId: z.uuid()
        }),
        response: {
          200: z.object({
            id: z.uuid(),
            name: z.string(),
            isRest: z.boolean(),
            coverImageUrl: z.url().optional(),
            estimatedDurationInSeconds: z.number(),
            weekDay: z.enum(WeekDay),
            exercises: z.array(
              z.object({
                id: z.uuid(),
                name: z.string(),
                workoutDayId: z.uuid(),
                order: z.number(),
                sets: z.number(),
                reps: z.number(),
                restTimeInSeconds: z.number()
              })
            ),
            sessions: z.array(
              z.object({
                id: z.uuid(),
                workoutDayId: z.uuid(),
                startedAt: z.iso.datetime().optional(),
                completedAt: z.iso.datetime().optional()
              })
            )
          }),
          401: errorSchema,
          403: errorSchema,
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

      const { workoutPlanId, workoutDayId } = request.params

      const getWorkoutDay = new GetWorkoutDay()
      const result = await getWorkoutDay.execute({
        userId: session.user.id,
        workoutPlanId,
        workoutDayId
      })

      return reply.status(200).send(result)
    }
  )

  app.withTypeProvider<ZodTypeProvider>().post(
    '/:workoutPlanId/days/:workoutDayId/sessions',
    {
      schema: {
        operationId: 'startWorkoutSession',
        tags: ['Workout Plan'],
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

  app.withTypeProvider<ZodTypeProvider>().patch(
    '/:workoutPlanId/days/:workoutDayId/sessions/:workoutSessionId',
    {
      schema: {
        operationId: 'updateWorkoutSession',
        tags: ['Workout Plan'],
        summary: 'Update a workout session',
        params: z.object({
          workoutPlanId: z.uuid(),
          workoutDayId: z.uuid(),
          workoutSessionId: z.uuid()
        }),
        body: z.object({
          completedAt: z.iso.datetime()
        }),
        response: {
          200: z.object({
            id: z.uuid(),
            startedAt: z.iso.datetime(),
            completedAt: z.iso.datetime()
          }),
          401: errorSchema,
          403: errorSchema,
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

      const { workoutPlanId, workoutDayId, workoutSessionId } = request.params

      const completeWorkoutSession = new CompleteWorkoutSession()
      const result = await completeWorkoutSession.execute({
        userId: session.user.id,
        workoutPlanId,
        workoutDayId,
        workoutSessionId,
        completedAt: new Date(request.body.completedAt)
      })

      return reply.status(200).send(result)
    }
  )
}
