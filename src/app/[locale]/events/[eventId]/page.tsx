import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShareEventDialog } from '@/components/ShareEventDialog'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { EventSettingsContainer } from '@/components/event/event-settings-container'
import { DeleteEventButton } from '@/components/event/delete-event-button'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  ArrowLeft,
  Edit,
  Trash,
  Share2
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getEventById, isValidEventId } from '@/services/event-service'
import { MembersSection } from "@/components/events/members-section"
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'Event Details',
  description: 'View event details and manage event settings',
}

async function getEvent(eventId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  try {
    if (!isValidEventId(eventId)) {
      console.error('Invalid event ID format:', eventId)
      return null
    }

    return await getEventById(eventId, session.user.id)
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

interface EventPageProps {
  params: {
    eventId: string
    locale: string
  }
}

function EventErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
      <p className="text-muted-foreground mb-4">
        The event you're looking for could not be found or you don't have permission to view it.
      </p>
      <Button asChild>
        <Link href="/events">Go to Events</Link>
      </Button>
    </div>
  )
}

export default async function EventPage({ params }: EventPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const event = await getEvent(params.eventId)
  if (!event) {
    return <EventErrorFallback />
  }

  const isCreator = event.userId === session.user.id
  const isAdmin = event.members?.some(
    member => member.userId === session.user.id && ['OWNER', 'ADMIN'].includes(member.role)
  )

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link 
                href={`/${params.locale}/events`}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
            </Button>
          </div>

          {/* Event Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={event.isPublic ? "secondary" : "outline"}>
                  {event.isPublic ? "Public" : "Private"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created by {isCreator ? 'you' : event.creator?.name || 'Unknown'}
                </span>
              </div>
            </div>

            {(isCreator || isAdmin) && (
              <div className="flex items-center gap-2">
                <ShareEventDialog event={event} trigger={
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                } />
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${params.locale}/events/${event.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                {isCreator && (
                  <DeleteEventButton 
                    eventId={event.id} 
                    locale={params.locale}
                  />
                )}
              </div>
            )}
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="flex items-start p-4">
                <Calendar className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(event.startDate)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start p-4">
                <Clock className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(event.startDate, 'HH:mm')} - {formatDateTime(event.endDate, 'HH:mm')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start p-4">
                <MapPin className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {event.location ? (
                      <>
                        {event.location.city}, {event.location.country}
                      </>
                    ) : (
                      'No location set'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start p-4">
                <Users className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">
                    {event._count?.members || 0} / {event.capacity || 'Unlimited'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Content */}
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activities">Activities ({event._count?.activities || 0})</TabsTrigger>
              <TabsTrigger value="members">Members ({event._count?.members || 0})</TabsTrigger>
              {(isCreator || isAdmin) && (
                <TabsTrigger value="settings">Settings</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardContent className="p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {event.description || 'No description provided.'}
                    </p>

                    {/* Highlights Section */}
                    {event.highlights && event.highlights.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold mt-6 mb-2">Highlights</h3>
                        <ul className="list-disc list-inside space-y-2">
                          {event.highlights.map((highlight, index) => (
                            <li key={index} className="text-muted-foreground">
                              {highlight.text}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {event.location && (
                      <>
                        <h3 className="text-lg font-semibold mt-6 mb-2">Location Details</h3>
                        <p className="text-muted-foreground">
                          {event.location.address && (
                            <span className="block">{event.location.address}</span>
                          )}
                          {event.location.city && event.location.country && (
                            <span className="block">
                              {event.location.city}, {event.location.country}
                            </span>
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Activities</h3>
                    {(isCreator || isAdmin) && (
                      <Button asChild>
                        <Link href={`/${params.locale}/activities/create?eventId=${event.id}`}>
                          Create Activity
                        </Link>
                      </Button>
                    )}
                  </div>
                  {event._count?.activities === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No activities planned yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {event.activities?.map((activity) => (
                        <Card key={activity.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{activity.title}</h4>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {formatDateTime(activity.startTime, 'HH:mm')} - {formatDateTime(activity.endTime, 'HH:mm')}
                                  </span>
                                  <Badge variant="secondary">{activity.status}</Badge>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/${params.locale}/activities/${activity.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <MembersSection 
                eventId={event.id} 
                isCreator={isCreator}
                isAdmin={isAdmin}
              />
            </TabsContent>

            {(isCreator || isAdmin) && (
              <TabsContent value="settings">
                <EventSettingsContainer event={event} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic';