import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'

interface SharedEventPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: SharedEventPageProps): Promise<Metadata> {
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
    title: event.title,
    description: event.description || 'Shared event details',
  }
}

export default async function SharedEventPage({ params }: SharedEventPageProps) {
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
          activities: true,
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
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
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
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{event._count.activities} activities</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <a href={`/events/join/${event.shareableSlug}`}>Join Event</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 