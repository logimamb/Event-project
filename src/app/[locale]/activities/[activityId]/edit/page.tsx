import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { EditActivityForm } from './edit-activity-form'
import { getTranslations } from 'next-intl/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { prisma } from '@/lib/prisma'

interface EditActivityPageProps {
  params: {
    activityId: string
  }
}

export async function generateMetadata({ params }: EditActivityPageProps): Promise<Metadata> {
  const t = await getTranslations('activities')
  const activity = await prisma.activity.findUnique({
    where: { id: params.activityId },
    select: { title: true }
  })

  return {
    title: activity ? `${t('form.editTitle')} - ${activity.title}` : t('form.editTitle'),
    description: t('description'),
  }
}

export default async function EditActivityPage({ params }: EditActivityPageProps) {
  const session = await getServerSession(authOptions)
  const t = await getTranslations('activities')

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const activity = await prisma.activity.findUnique({
    where: { 
      id: params.activityId,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  if (!activity || activity.userId !== session.user.id) {
    notFound()
  }

  // Format dates to ISO strings to prevent serialization issues
  const formattedActivity = {
    ...activity,
    startTime: activity.startTime.toISOString(),
    endTime: activity.endTime.toISOString(),
  }

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-6 lg:py-10">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl">{t('editActivity')}</h1>
            <p className="text-lg text-muted-foreground">
              {t('description')}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 lg:p-8">
            <EditActivityForm 
              activity={formattedActivity}
              userId={session.user.id}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
