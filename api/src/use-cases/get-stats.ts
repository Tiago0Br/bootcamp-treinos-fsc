import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import type { WeekDay } from '../generated/prisma/enums.js'
import { prisma } from '../lib/prisma.js'

dayjs.extend(utc)

const DAY_INDEX_TO_WEEK_DAY: Record<number, WeekDay> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY'
}

interface InputDto {
  userId: string
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
}

interface ConsistencyEntry {
  workoutDayCompleted: boolean
  workoutDayStarted: boolean
}

interface OutputDto {
  workoutStreak: number
  consistencyByDay: Record<string, ConsistencyEntry>
  completedWorkoutsCount: number
  conclusionRate: number
  totalTimeInSeconds: number
}

export class GetStats {
  async execute(dto: InputDto): Promise<OutputDto> {
    const fromDate = dayjs.utc(dto.from).startOf('day')
    const toDate = dayjs.utc(dto.to).endOf('day')

    const sessions = await prisma.workoutSession.findMany({
      where: {
        startedAt: {
          gte: fromDate.toDate(),
          lte: toDate.toDate()
        },
        workoutDay: {
          workoutPlan: {
            userId: dto.userId
          }
        }
      }
    })

    const consistencyByDay: Record<string, ConsistencyEntry> = {}

    for (const session of sessions) {
      const dateKey = dayjs.utc(session.startedAt).format('YYYY-MM-DD')
      if (!consistencyByDay[dateKey]) {
        consistencyByDay[dateKey] = {
          workoutDayCompleted: false,
          workoutDayStarted: false
        }
      }
      consistencyByDay[dateKey].workoutDayStarted = true
      if (session.completedAt) {
        consistencyByDay[dateKey].workoutDayCompleted = true
      }
    }

    const completedSessions = sessions.filter((s) => s.completedAt !== null)
    const completedWorkoutsCount = completedSessions.length
    const totalSessions = sessions.length
    const conclusionRate =
      totalSessions === 0 ? 0 : completedWorkoutsCount / totalSessions

    const totalTimeInSeconds = completedSessions.reduce((acc, session) => {
      if (!session.completedAt) return acc
      const diff = dayjs
        .utc(session.completedAt)
        .diff(dayjs.utc(session.startedAt), 'second')
      return acc + diff
    }, 0)

    const activeWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: dto.userId,
        isActive: true
      },
      include: {
        workoutDays: {
          select: { weekDay: true }
        }
      }
    })

    let workoutStreak = 0

    if (activeWorkoutPlan) {
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

      let currentDate = dayjs.utc(dto.to)
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
    }

    return {
      workoutStreak,
      consistencyByDay,
      completedWorkoutsCount,
      conclusionRate,
      totalTimeInSeconds
    }
  }
}
