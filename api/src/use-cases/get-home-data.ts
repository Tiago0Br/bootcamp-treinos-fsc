import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import { NotFoundError } from '../errors/index.js'
import { WeekDay } from '../generated/prisma/enums.js'
import { prisma } from '../lib/prisma.js'

dayjs.extend(utc)

const DAY_INDEX_TO_WEEK_DAY: Record<number, WeekDay> = {
  0: WeekDay.SUNDAY,
  1: WeekDay.MONDAY,
  2: WeekDay.TUESDAY,
  3: WeekDay.WEDNESDAY,
  4: WeekDay.THURSDAY,
  5: WeekDay.FRIDAY,
  6: WeekDay.SATURDAY
}

interface InputDto {
  userId: string
  date: string // YYYY-MM-DD
}

interface ConsistencyEntry {
  workoutDayCompleted: boolean
  workoutDayStarted: boolean
}

interface OutputDto {
  activeWorkoutPlanId: string
  todayWorkoutDay: {
    workoutPlanId: string
    id: string
    name: string
    isRest: boolean
    weekDay: string
    estimatedDurationInSeconds: number
    coverImageUrl?: string
    exercisesCount: number
  }
  workoutStreak: number
  consistencyByDay: Record<string, ConsistencyEntry>
}

export class GetHomeData {
  async execute(dto: InputDto): Promise<OutputDto> {
    const activeWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: dto.userId,
        isActive: true
      },
      include: {
        workoutDays: {
          include: {
            workoutExercices: true
          }
        }
      }
    })

    if (!activeWorkoutPlan) {
      throw new NotFoundError('No active workout plan found')
    }

    const date = dayjs.utc(dto.date)
    const todayWeekDay = DAY_INDEX_TO_WEEK_DAY[date.day()]

    const todayWorkoutDay = activeWorkoutPlan.workoutDays.find(
      (day) => day.weekDay === todayWeekDay
    )

    if (!todayWorkoutDay) {
      throw new NotFoundError('No workout day found for today')
    }

    const weekStart = date.startOf('week')
    const weekEnd = date.endOf('week')

    const weekSessions = await prisma.workoutSession.findMany({
      where: {
        startedAt: {
          gte: weekStart.toDate(),
          lte: weekEnd.toDate()
        },
        workoutDay: {
          workoutPlan: {
            userId: dto.userId
          }
        }
      }
    })

    const consistencyByDay: Record<string, ConsistencyEntry> = {}

    for (let i = 0; i < 7; i++) {
      const dayKey = weekStart.add(i, 'day').format('YYYY-MM-DD')
      consistencyByDay[dayKey] = {
        workoutDayCompleted: false,
        workoutDayStarted: false
      }
    }

    for (const session of weekSessions) {
      const sessionDate = dayjs.utc(session.startedAt).format('YYYY-MM-DD')
      const entry = consistencyByDay[sessionDate]
      if (entry) {
        entry.workoutDayStarted = true
        if (session.completedAt) {
          entry.workoutDayCompleted = true
        }
      }
    }

    const allCompletedSessions = await prisma.workoutSession.findMany({
      where: {
        completedAt: { not: null },
        workoutDay: {
          workoutPlan: {
            userId: dto.userId
          }
        }
      },
      select: { startedAt: true }
    })

    const completedDates = new Set(
      allCompletedSessions.map((s) =>
        dayjs.utc(s.startedAt).format('YYYY-MM-DD')
      )
    )

    const planWeekDays = new Set(
      activeWorkoutPlan.workoutDays.map((d) => d.weekDay)
    )

    let workoutStreak = 0
    let currentDate = date
    const MAX_LOOKBACK_DAYS = 366

    for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
      const weekDay = DAY_INDEX_TO_WEEK_DAY[currentDate.day()]

      if (planWeekDays.has(weekDay)) {
        const dateStr = currentDate.format('YYYY-MM-DD')
        if (completedDates.has(dateStr)) {
          workoutStreak++
        } else {
          break
        }
      }

      currentDate = currentDate.subtract(1, 'day')
    }

    return {
      activeWorkoutPlanId: activeWorkoutPlan.id,
      todayWorkoutDay: {
        workoutPlanId: activeWorkoutPlan.id,
        id: todayWorkoutDay.id,
        name: todayWorkoutDay.name,
        isRest: todayWorkoutDay.isRest,
        weekDay: todayWorkoutDay.weekDay,
        estimatedDurationInSeconds: todayWorkoutDay.estimatedDurationInSeconds,
        coverImageUrl: todayWorkoutDay.coverImageUrl ?? undefined,
        exercisesCount: todayWorkoutDay.workoutExercices.length
      },
      workoutStreak,
      consistencyByDay
    }
  }
}
