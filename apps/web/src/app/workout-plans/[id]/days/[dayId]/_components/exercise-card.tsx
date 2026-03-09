'use client'

import { CircleHelpIcon, ZapIcon } from 'lucide-react'
import { parseAsBoolean, parseAsString, useQueryStates } from 'nuqs'
import { Button } from '@/components/ui/button'
import type { GetWorkoutDayById200ExercisesItem } from '@/lib/api/fetch-generated'

interface ExerciseCardProps {
  exercise: GetWorkoutDayById200ExercisesItem
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [, setChatParams] = useQueryStates({
    chat_open: parseAsBoolean.withDefault(false),
    chat_initial_message: parseAsString
  })

  const handleHelp = () => {
    setChatParams({
      chat_open: true,
      chat_initial_message: `Como executar o exercício ${exercise.name} corretamente?`
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-5">
      <div className="flex items-center justify-between">
        <span className="font-heading text-base font-semibold text-foreground">
          {exercise.name}
        </span>
        <Button variant="ghost" size="icon" onClick={handleHelp}>
          <CircleHelpIcon className="size-5 text-muted-foreground" />
        </Button>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground">
          {exercise.sets} séries
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground">
          {exercise.reps} reps
        </span>
        <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground">
          <ZapIcon className="size-3.5" />
          {exercise.restTimeInSeconds}s
        </span>
      </div>
    </div>
  )
}
