'use client'

import { Sparkles } from 'lucide-react'
import { parseAsBoolean, parseAsString, useQueryStates } from 'nuqs'

export function ChatOpenButton() {
  const [, setChatParams] = useQueryStates({
    chat_open: parseAsBoolean.withDefault(false),
    chat_initial_message: parseAsString
  })

  return (
    <button
      type="button"
      onClick={() => setChatParams({ chat_open: true })}
      className="rounded-full bg-primary p-4"
    >
      <Sparkles className="size-6 text-primary-foreground" />
    </button>
  )
}
