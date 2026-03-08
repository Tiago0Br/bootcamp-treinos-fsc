import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default async function Home() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers()
    }
  })

  if (!session.data?.user) redirect('/auth')

  return <h1>Hello World</h1>
}
