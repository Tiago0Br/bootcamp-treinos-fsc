import dayjs from 'dayjs'
import {
  CalendarIcon,
  ChartNoAxesColumnIcon,
  HouseIcon,
  UserRoundIcon
} from 'lucide-react'
import Link from 'next/link'
import { getHomeData } from '@/lib/api/fetch-generated'
import { cn } from '@/lib/utils'
import { ChatOpenButton } from './chat-open-button'

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-6 rounded-t-4xl border border-border bg-background px-6 py-4 lg:right-auto lg:top-0 lg:h-svh lg:w-64 lg:flex-col lg:items-start lg:justify-start lg:gap-1 lg:rounded-none lg:border-0 lg:border-r lg:px-4 lg:py-8">
      <div className="mb-4 hidden px-3 lg:block">
        <p
          className="text-[22px] uppercase leading-[1.15] text-foreground"
          style={{ fontFamily: 'var(--font-anton)' }}
        >
          Fit.ai
        </p>
      </div>

      <Link
        href="/"
        className={cn(
          'flex items-center gap-3 rounded-xl p-3 transition-colors lg:w-full lg:px-3 lg:py-2.5',
          activePage === 'home' ? 'lg:bg-muted' : 'lg:hover:bg-muted'
        )}
      >
        <HouseIcon
          className={cn(
            'size-6',
            activePage === 'home' ? 'text-foreground' : 'text-muted-foreground'
          )}
        />
        <span
          className={cn(
            'hidden lg:inline font-heading text-sm',
            activePage === 'home'
              ? 'font-semibold text-foreground'
              : 'text-muted-foreground'
          )}
        >
          Início
        </span>
      </Link>

      {calendarHref ? (
        <Link
          href={calendarHref}
          className={cn(
            'flex items-center gap-3 rounded-xl p-3 transition-colors lg:w-full lg:px-3 lg:py-2.5',
            activePage === 'calendar' ? 'lg:bg-muted' : 'lg:hover:bg-muted'
          )}
        >
          <CalendarIcon
            className={cn(
              'size-6',
              activePage === 'calendar'
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          />
          <span
            className={cn(
              'hidden lg:inline font-heading text-sm',
              activePage === 'calendar'
                ? 'font-semibold text-foreground'
                : 'text-muted-foreground'
            )}
          >
            Calendário
          </span>
        </Link>
      ) : (
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl p-3 transition-colors lg:w-full lg:px-3 lg:py-2.5 lg:hover:bg-muted"
        >
          <CalendarIcon
            className={cn(
              'size-6',
              activePage === 'calendar'
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          />
          <span
            className={cn(
              'hidden lg:inline font-heading text-sm',
              activePage === 'calendar'
                ? 'font-semibold text-foreground'
                : 'text-muted-foreground'
            )}
          >
            Calendário
          </span>
        </button>
      )}

      <div className="lg:w-full">
        <ChatOpenButton />
      </div>

      <Link
        href="/stats"
        className={cn(
          'flex items-center gap-3 rounded-xl p-3 transition-colors lg:w-full lg:px-3 lg:py-2.5',
          activePage === 'stats' ? 'lg:bg-muted' : 'lg:hover:bg-muted'
        )}
      >
        <ChartNoAxesColumnIcon
          className={cn(
            'size-6',
            activePage === 'stats' ? 'text-foreground' : 'text-muted-foreground'
          )}
        />
        <span
          className={cn(
            'hidden lg:inline font-heading text-sm',
            activePage === 'stats'
              ? 'font-semibold text-foreground'
              : 'text-muted-foreground'
          )}
        >
          Estatísticas
        </span>
      </Link>

      <Link
        href="/profile"
        className={cn(
          'flex items-center gap-3 rounded-xl p-3 transition-colors lg:w-full lg:px-3 lg:py-2.5',
          activePage === 'profile' ? 'lg:bg-muted' : 'lg:hover:bg-muted'
        )}
      >
        <UserRoundIcon
          className={cn(
            'size-6',
            activePage === 'profile'
              ? 'text-foreground'
              : 'text-muted-foreground'
          )}
        />
        <span
          className={cn(
            'hidden lg:inline font-heading text-sm',
            activePage === 'profile'
              ? 'font-semibold text-foreground'
              : 'text-muted-foreground'
          )}
        >
          Perfil
        </span>
      </Link>
    </nav>
  )
}
