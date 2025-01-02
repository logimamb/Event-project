import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Tag, Users, Calendar, Clock, FileText, CheckCircle } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { AccessibilityFeatures } from '@/components/AccessibilityFeatures'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shared Activity',
  description: 'View shared activity details',
}

interface SharedActivityPageProps {
  params: {
    activityId: string
  }
  searchParams: {
    token?: string
  }
}

export default async function SharedActivityPage({ 
  params: { activityId },
  searchParams: { token }
}: SharedActivityPageProps) {
  const activity = await prisma.activity.findUnique({
    where: {
      id: activityId,
    },
    include: {
      event: {
        include: {
          location: true
        }
      },
      user: true,
      participants: true,
      _count: {
        select: {
          participants: true
        }
      }
    }
  })

  if (!activity) {
    notFound()
  }

  // If token is provided, verify and update invitation
  if (token) {
    const invitation = await prisma.activityInvitation.findUnique({
      where: { token }
    })

    if (invitation && invitation.expiresAt > new Date()) {
      await prisma.activityInvitation.update({
        where: { token },
        data: { status: 'viewed' }
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl py-12">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
                <Users className="h-3.5 w-3.5" />
                {activity._count.participants} / {activity.maxParticipants || 'Unlimited'}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{activity.title}</h1>
            {activity.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{activity.description}</p>
            )}
          </div>

          {/* Key Information */}
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Date & Time</p>
                    <p className="text-base font-semibold mt-1">
                      {formatDate(activity.startTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Event</p>
                    <p className="text-base font-semibold mt-1">
                      {activity.event?.title || 'Independent Activity'}
                    </p>
                    {activity.event?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {activity.event.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Location</p>
                    <p className="text-base font-semibold mt-1">
                      {activity.location || 'No location specified'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Location Details */}
          {activity.event?.location && (
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Event Location</h2>
                </div>
                <div className="space-y-2 text-muted-foreground pl-11">
                  <p>{activity.event.location.address}</p>
                  <p>
                    {activity.event.location.city}, {activity.event.location.state} {activity.event.location.zipCode}
                  </p>
                  <p>{activity.event.location.country}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accessibility Information */}
          {activity.accessibility && (
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Accessibility Information</h2>
                </div>
                <div className="pl-11">
                  <AccessibilityFeatures accessibility={activity.accessibility} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 