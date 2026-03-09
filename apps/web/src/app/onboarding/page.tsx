import dayjs from 'dayjs'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Chat } from '@/app/_components/chat'
import { getHomeData, getUserTrainData } from '@/lib/api/fetch-generated'
import { authClient } from '@/lib/auth-client'

export default async function OnboardingPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers()
    }
  })

  if (!session.data?.user) redirect('/auth')

  const [homeData, trainData] = await Promise.all([
    getHomeData(dayjs().format('YYYY-MM-DD')),
    getUserTrainData()
  ])

  if (
    homeData.status === 200 &&
    trainData.status === 200 &&
    homeData.data.activeWorkoutPlanId &&
    trainData.data
  ) {
    redirect('/')
  }

  return (
    <Chat embedded initialMessage="Quero começar a melhorar minha saúde!" />
  )
}
