import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar, Clock, MapPin, ListTodo } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { sampleEvents } from '@/lib/static-data'
import { AccessibilityFeatures } from '@/components/AccessibilityFeatures'
import { VirtualAccessInfo } from '@/components/VirtualAccessInfo'

interface PublicEventPageProps {
  params: {
    eventId: string
  }
}

async function getEvent(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        activities: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        },
        calendar: true,
        _count: {
          select: { 
            activities: true,
            members: true
          },
        },
      },
    })

    if (event) return event

    // Fallback to static data
    const staticEvent = sampleEvents.find(e => e.id === eventId)
    if (!staticEvent) return null

    return {
      ...staticEvent,
      _count: {
        activities: staticEvent.activities?.length || 0,
        members: 0
      }
    }
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const event = await getEvent(params.eventId)

  if (!event) notFound()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" tabIndex={0}>
              {event.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8" tabIndex={0}>
              {event.description}
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 mr-2" aria-hidden="true" />
                <span tabIndex={0}>
                  {format(new Date(event.startDate), 'PPP')}
                </span>
              </div>

              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5 mr-2" aria-hidden="true" />
                <span tabIndex={0}>
                  {format(new Date(event.startDate), 'p')} - {format(new Date(event.endDate), 'p')}
                </span>
              </div>

              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 mr-2" aria-hidden="true" />
                <span tabIndex={0}>{event.location}</span>
              </div>

              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <ListTodo className="w-5 h-5 mr-2" aria-hidden="true" />
                <span tabIndex={0}>{event._count.activities} Activities</span>
              </div>
            </div>

            {/* Accessibility Information */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Accessibility Information
              </h2>
              <AccessibilityFeatures accessibility={event.accessibility} />
            </div>

            {/* Virtual Access Information */}
            {event.virtualAccess && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Virtual Access
                </h2>
                <VirtualAccessInfo virtualAccess={event.virtualAccess} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 