import { Metadata } from 'next'
import { Suspense } from 'react'
import { ActivityCardSkeleton } from "@/components/activity/activity-card-skeleton"
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getTranslations } from 'next-intl/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ActivitiesContent } from '@/components/activities/activities-content'

async function getActivities() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return []
  }

  const activities = await prisma.activity.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        {
          participants: {
            some: {
              OR: [
                { userId: session.user.id },
                { email: session.user.email }
              ]
            }
          }
        }
      ]
    },
    include: {
      user: {
        select: {
          name: true,
          image: true
        }
      },
      participants: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return activities.map(activity => ({
    ...activity,
    startTime: activity.startTime.toISOString(),
    endTime: activity.endTime.toISOString(),
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
  }))
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations('activities')
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function ActivitiesPage() {
  const t = await getTranslations('activities')
  const activities = await getActivities()

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={[...Array(6)].map((_, i) => (
          <ActivityCardSkeleton key={i} />
        ))}>
          <ActivitiesContent 
            activities={activities} 
            title={t('title')} 
            createLabel={t('create')}
            errorLabel={t('errorLoading')}
          />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
