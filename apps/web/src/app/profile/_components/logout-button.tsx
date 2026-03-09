'use client'

import { LogOutIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await authClient.signOut()

    if (error) {
      console.error(error.message)
      return
    }

    router.push('/auth')
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="gap-2 text-destructive hover:text-destructive"
    >
      <span className="font-heading text-base font-semibold">
        Sair da conta
      </span>
      <LogOutIcon className="size-4" />
    </Button>
  )
}
