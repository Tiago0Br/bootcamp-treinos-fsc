import { z } from 'zod'
import { WeekDay } from '../generated/prisma/enums.js'

export const listWorkoutPlansQuerySchema = z.object({
  active: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional()
})

export const listWorkoutPlansSchema = z.array(
  z.object({
    id: z.uuid(),
    name: z.string(),
    isActive: z.boolean(),
    workoutDays: z.array(
      z.object({
        id: z.uuid(),
        name: z.string(),
        weekDay: z.enum(WeekDay),
        isRest: z.boolean(),
        estimatedDurationInSeconds: z.number(),
        coverImageUrl: z.url().optional(),
        exercises: z.array(
          z.object({
            id: z.uuid(),
            order: z.number(),
            name: z.string(),
            sets: z.number(),
            reps: z.number(),
            restTimeInSeconds: z.number()
          })
        )
      })
    )
  })
)

export const errorSchema = z.object({
  error: z.string(),
  code: z.string()
})
