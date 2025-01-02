import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { NewActivityContent } from '@/components/activity/new-activity-content'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface NewActivityPageProps {
  params: {
    eventId: string
  }
}

export default async function NewActivityPage({ params }: NewActivityPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <NewActivityContent eventId={params.eventId} />
      </div>
    </DashboardLayout>
  )
} 