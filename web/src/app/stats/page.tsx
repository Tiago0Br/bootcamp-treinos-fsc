import dayjs from 'dayjs'
import { CircleCheckIcon, CirclePercentIcon, HourglassIcon } from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/app/_components/bottom-nav'
import {
  getHomeData,
  getUserTrainData,
  getWorkoutStats
} from '@/lib/api/fetch-generated'
import { authClient } from '@/lib/auth-client'
import { StatCard } from './_components/stat-card'
import { StatsHeatmap } from './_components/stats-heatmap'
import { StreakBanner } from './_components/streak-banner'

function formatTotalTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return `${hours}h${minutes.toString().padStart(2, '0')}m`
}

export default async function StatsPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers()
    }
  })

  if (!session.data?.user) redirect('/auth')

  const today = dayjs()
  const from = today.subtract(2, 'month').startOf('month').format('YYYY-MM-DD')
  const to = today.endOf('month').format('YYYY-MM-DD')

  const [statsResponse, homeData, trainData] = await Promise.all([
    getWorkoutStats({ from, to }),
    getHomeData(today.format('YYYY-MM-DD')),
    getUserTrainData()
  ])

  const needsOnboarding =
    (homeData.status === 200 && !homeData.data.activeWorkoutPlanId) ||
    (trainData.status === 200 && !trainData.data)
  if (needsOnboarding) redirect('/onboarding')

  if (statsResponse.status !== 200) {
    throw new Error('Failed to fetch stats')
  }

  const {
    workoutStreak,
    consistencyByDay,
    completedWorkoutsCount,
    conclusionRate,
    totalTimeInSeconds
  } = statsResponse.data

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div className="flex h-14 items-center px-5">
        <p
          className="text-[22px] uppercase leading-[1.15] text-foreground"
          style={{ fontFamily: 'var(--font-anton)' }}
        >
          Fit.ai
        </p>
      </div>

      <div className="px-5">
        <StreakBanner workoutStreak={workoutStreak} />
      </div>

      <div className="flex flex-col gap-3 p-5">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Consistência
        </h2>

        <StatsHeatmap consistencyByDay={consistencyByDay} today={today} />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={CircleCheckIcon}
            value={String(completedWorkoutsCount)}
            label="Treinos Feitos"
          />
          <StatCard
            icon={CirclePercentIcon}
            value={`${Math.round(conclusionRate * 100)}%`}
            label="Taxa de conclusão"
          />
        </div>

        <StatCard
          icon={HourglassIcon}
          value={formatTotalTime(totalTimeInSeconds)}
          label="Tempo Total"
        />
      </div>

      <BottomNav activePage="stats" />
    </div>
  )
}
