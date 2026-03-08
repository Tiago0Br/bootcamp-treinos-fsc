import dayjs from 'dayjs'
import { BicepsFlexedIcon, RulerIcon, UserIcon, WeightIcon } from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/app/_components/bottom-nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getHomeData, getUserTrainData } from '@/lib/api/fetch-generated'
import { authClient } from '@/lib/auth-client'
import { LogoutButton } from './_components/logout-button'

export default async function ProfilePage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers()
    }
  })

  if (!session.data?.user) redirect('/auth')

  const [trainData, homeData] = await Promise.all([
    getUserTrainData(),
    getHomeData(dayjs().format('YYYY-MM-DD'))
  ])

  if (trainData.status !== 200) {
    throw new Error('Failed to fetch user train data')
  }

  const needsOnboarding =
    (homeData.status === 200 && !homeData.data.activeWorkoutPlanId) ||
    !trainData.data
  if (needsOnboarding) redirect('/onboarding')

  const user = session.data.user
  const data = trainData.data

  const weightInKg = data ? data.weightInGrams / 1000 : null
  const heightInCm = data?.heightInCentimeters ?? null
  const bodyFatPercentage = data?.bodyFatPercentage ?? null
  const age = data?.age ?? null

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

      <div className="flex flex-col items-center gap-5 px-5 pt-5">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-13">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-heading text-lg font-semibold leading-[1.05] text-foreground">
                {user.name}
              </h1>
              <p className="font-heading text-sm leading-[1.15] text-foreground/70">
                Plano Basico
              </p>
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-5 rounded-xl bg-primary/8 p-5">
            <div className="flex items-center rounded-full bg-primary/8 p-2.25">
              <WeightIcon className="size-4 text-primary" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-heading text-2xl font-semibold leading-[1.15] text-foreground">
                {weightInKg ?? '-'}
              </span>
              <span className="font-heading text-xs uppercase leading-[1.4] text-muted-foreground">
                Kg
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 rounded-xl bg-primary/8 p-5">
            <div className="flex items-center rounded-full bg-primary/8 p-2.25">
              <RulerIcon className="size-4 text-primary" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-heading text-2xl font-semibold leading-[1.15] text-foreground">
                {heightInCm ?? '-'}
              </span>
              <span className="font-heading text-xs uppercase leading-[1.4] text-muted-foreground">
                Cm
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 rounded-xl bg-primary/8 p-5">
            <div className="flex items-center rounded-full bg-primary/8 p-2.25">
              <BicepsFlexedIcon className="size-4 text-primary" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-heading text-2xl font-semibold leading-[1.15] text-foreground">
                {bodyFatPercentage != null ? `${bodyFatPercentage}%` : '-'}
              </span>
              <span className="font-heading text-xs uppercase leading-[1.4] text-muted-foreground">
                Gc
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 rounded-xl bg-primary/8 p-5">
            <div className="flex items-center rounded-full bg-primary/8 p-2.25">
              <UserIcon className="size-4 text-primary" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-heading text-2xl font-semibold leading-[1.15] text-foreground">
                {age ?? '-'}
              </span>
              <span className="font-heading text-xs uppercase leading-[1.4] text-muted-foreground">
                Anos
              </span>
            </div>
          </div>
        </div>

        <LogoutButton />
      </div>

      <BottomNav activePage="profile" />
    </div>
  )
}
