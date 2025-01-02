import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { JoinEventForm } from '@/components/join-event-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Users } from 'lucide-react'

interface JoinEventPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: JoinEventPageProps): Promise<Metadata> {
  const event = await prisma.event.findFirst({
    where: {
      shareableSlug: params.slug,
    },
  })

  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The event you are looking for does not exist.',
    }
  }

  return {
    title: `Join ${event.title}`,
    description: event.description || 'Join this event',
  }
}

export default async function JoinEventPage({ params }: JoinEventPageProps) {
  const event = await prisma.event.findFirst({
    where: {
      shareableSlug: params.slug,
    },
    include: {
      location: true,
      category: true,
      _count: {
        select: {
          members: true,
        },
      },
    },
  })

  if (!event) {
    notFound()
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Join {event.title}</CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{event._count.members} members</span>
            </div>
          </div>
          <JoinEventForm inviteCode={event.shareableSlug} />
        </CardContent>
      </Card>
    </div>
  )
} 