import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ActivityListContainer } from '@/components/activities/activity-list-container'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { format } from 'date-fns'

interface ActivitiesPageProps {
  params: {
    eventId: string
  }
}

function formatDate(date: Date) {
  return format(date, 'PPp')
}

async function getEventWithActivities(eventId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return null
  }

  const event = await prisma.event.findFirst({
    where: { 
      id: eventId,
      OR: [
        { userId: session.user.id },
        { members: { some: { userId: session.user.id } } }
      ]
    },
    include: {
      activities: {
        orderBy: { startDate: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          participants: true
        }
      },
      location: true
    }
  })

  if (!event) return null

  // Transform dates to formatted strings
  return {
    ...event,
    activities: event.activities.map(activity => ({
      ...activity,
      formattedStartDate: formatDate(activity.startDate),
      formattedEndDate: formatDate(activity.endDate),
      startDate: activity.startDate.toISOString(),
      endDate: activity.endDate.toISOString(),
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString()
    }))
  }
}

export default async function ActivitiesPage({ params }: ActivitiesPageProps) {
  const event = await getEventWithActivities(params.eventId)

  if (!event) notFound()

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-2 transition-colors"
            >
              ← Back to Event
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Activities for {event.title}
            </h1>
          </div>

          <Link href={`/events/${event.id}/activities/new`}>
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              Add Activity
            </Button>
          </Link>
        </div>

        <ActivityListContainer 
          initialActivities={event.activities} 
          eventId={event.id} 
        />
      </div>
    </DashboardLayout>
  )
}