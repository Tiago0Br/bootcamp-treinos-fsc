import type { WeekDay } from '../generated/prisma/enums.js'
import { prisma } from '../lib/prisma.js'

interface InputDto {
  userId: string
  name: string
  workoutDays: {
    name: string
    weekDay: WeekDay
    isRest: boolean
    estimatedDurationInSeconds: number
    exercices: {
      name: string
      order: number
      sets: number
      reps: number
      restTimeInSeconds: number
    }[]
  }[]
}

interface OutputDto {
  workoutPlanId: string
}

export class CreateWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    const existingWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: dto.userId,
        isActive: true
      }
    })

    const workoutPlan = await prisma.$transaction(async (tx) => {
      if (existingWorkoutPlan) {
        await tx.workoutPlan.update({
          where: { id: existingWorkoutPlan.id },
          data: { isActive: false }
        })
      }

      const result = await tx.workoutPlan.create({
        data: {
          name: dto.name,
          userId: dto.userId,
          isActive: true,
          workoutDays: {
            create: dto.workoutDays.map((workoutDay) => ({
              name: workoutDay.name,
              weekDay: workoutDay.weekDay,
              isRest: workoutDay.isRest,
              estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
              workoutExercices: {
                create: workoutDay.exercices.map((exercice) => ({
                  name: exercice.name,
                  order: exercice.order,
                  sets: exercice.sets,
                  reps: exercice.reps,
                  restTimeInSeconds: exercice.restTimeInSeconds
                }))
              }
            }))
          }
        }
      })

      return result
    })

    return {
      workoutPlanId: workoutPlan.id
    }
  }
}
