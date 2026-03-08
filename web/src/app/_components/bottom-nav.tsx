import dayjs from 'dayjs'
import {
  Calendar,
  ChartNoAxesColumn,
  House,
  SparklesIcon,
  UserRound
} from 'lucide-react'
import Link from 'next/link'
import { getHomeData } from '@/lib/api/fetch-generated'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  activePage?: 'home' | 'calendar' | 'stats' | 'profile'
}

export async function BottomNav({ activePage = 'home' }: BottomNavProps) {
  const today = dayjs()
  const homeData = await getHomeData(today.format('YYYY-MM-DD'))

  const calendarHref =
    homeData.status === 200 && homeData.data.activeWorkoutPlanId
      ? `/workout-plans/${homeData.data.activeWorkoutPlanId}`
      : null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-6 rounded-t-4xl border border-border bg-background px-6 py-4">
      <Link href="/" className="p-3">
        <House
          className={cn(
            'size-6',
            activePage === 'home' ? 'text-foreground' : 'text-muted-foreground'
          )}
        />
      </Link>
      {calendarHref ? (
        <Link href={calendarHref} className="p-3">
          <Calendar
            className={cn(
              'size-6',
              activePage === 'calendar'
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          />
        </Link>
      ) : (
        <button type="button" className="p-3">
          <Calendar
            className={cn(
              'size-6',
              activePage === 'calendar'
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          />
        </button>
      )}
      <button type="button" className="rounded-full bg-primary p-4">
        <SparklesIcon className="size-6 text-primary-foreground" />
      </button>
      <Link href="/stats" className="p-3">
        <ChartNoAxesColumn
          className={cn(
            'size-6',
            activePage === 'stats' ? 'text-foreground' : 'text-muted-foreground'
          )}
        />
      </Link>
      <Link href="/profile" className="p-3">
        <UserRound
          className={cn(
            'size-6',
            activePage === 'profile'
              ? 'text-foreground'
              : 'text-muted-foreground'
          )}
        />
      </Link>
    </nav>
  )
}
