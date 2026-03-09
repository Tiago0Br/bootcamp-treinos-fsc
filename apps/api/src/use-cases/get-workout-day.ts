import { NotFoundError, UnauthorizedError } from '../errors/index.js'
import type { WeekDay } from '../generated/prisma/enums.js'
import { prisma } from '../lib/prisma.js'

interface InputDto {
  userId: string
  workoutPlanId: string
  workoutDayId: string
}

interface OutputDto {
  id: string
  name: string
  isRest: boolean
  coverImageUrl?: string
  estimatedDurationInSeconds: number
  weekDay: WeekDay
  exercises: Array<{
    id: string
    name: string
    workoutDayId: string
    order: number
    sets: number
    reps: number
    restTimeInSeconds: number
  }>
  sessions: Array<{
    id: string
    workoutDayId: string
    startedAt?: string
    completedAt?: string
  }>
}

export class GetWorkoutDay {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId }
    })

    if (!workoutPlan) {
      throw new NotFoundError('Workout plan not found')
    }

    if (workoutPlan.userId !== dto.userId) {
      throw new UnauthorizedError('You are not the owner of this workout plan')
    }

    const workoutDay = await prisma.workoutDay.findFirst({
      where: { id: dto.workoutDayId, workoutPlanId: dto.workoutPlanId },
      include: {
        workoutExercices: {
          orderBy: { order: 'asc' }
        },
        workoutSessions: {
          orderBy: { startedAt: 'desc' }
        }
      }
    })

    if (!workoutDay) {
      throw new NotFoundError('Workout day not found')
    }

    return {
      id: workoutDay.id,
      name: workoutDay.name,
      isRest: workoutDay.isRest,
      coverImageUrl: workoutDay.coverImageUrl ?? undefined,
      estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
      weekDay: workoutDay.weekDay,
      exercises: workoutDay.workoutExercices.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        workoutDayId: exercise.workoutDayId,
        order: exercise.order,
        sets: exercise.sets,
        reps: exercise.reps,
        restTimeInSeconds: exercise.restTimeInSeconds
      })),
      sessions: workoutDay.workoutSessions.map((session) => ({
        id: session.id,
        workoutDayId: session.workoutDayId,
        startedAt: session.startedAt?.toISOString(),
        completedAt: session.completedAt?.toISOString() ?? undefined
      }))
    }
  }
}
