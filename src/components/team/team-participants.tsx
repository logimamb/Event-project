'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Users, Calendar, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TeamParticipant {
  id: string
  type: 'event' | 'activity'
  name: string
  email: string
  role?: string
  status?: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
  event?: {
    id: string
    title: string
    status: string
    startDate: string
    endDate: string
  }
  activity?: {
    id: string
    title: string
    status: string
    startTime: string
    endTime: string
  }
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canInvite: boolean
    isSelf: boolean
  }
}

interface ApiResponse {
  eventMembers: TeamParticipant[]
  activityParticipants: TeamParticipant[]
}

interface TeamParticipantsProps {
  teamId: string
}

export function TeamParticipants({ teamId }: TeamParticipantsProps) {
  const t = useTranslations('teams')
  const [participants, setParticipants] = useState<TeamParticipant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`/api/team`)
        if (!res.ok) {
          throw new Error('Failed to fetch participants')
        }
        const data: ApiResponse = await res.json()
        const allParticipants = [...data.eventMembers, ...data.activityParticipants]
        setParticipants(allParticipants)
      } catch (error) {
        console.error('Error fetching participants:', error)
        setError('Failed to load participants')
      } finally {
        setIsLoading(false)
      }
    }

    fetchParticipants()
  }, [])

  const filteredParticipants = participants.filter(participant => {
    const searchLower = searchTerm.toLowerCase()
    return (
      participant.name?.toLowerCase().includes(searchLower) ||
      participant.email?.toLowerCase().includes(searchLower) ||
      participant.event?.title.toLowerCase().includes(searchLower) ||
      participant.activity?.title.toLowerCase().includes(searchLower)
    )
  })

  // Group participants by activity
  const participantsByActivity = participants
    .filter(p => p.type === 'activity')
    .reduce((acc, participant) => {
      if (!participant.activity) return acc
      const existing = acc.find(x => x.id === participant.activity!.id)
      if (existing) {
        existing.participants.push(participant)
      } else {
        acc.push({
          id: participant.activity.id,
          title: participant.activity.title,
          participants: [participant]
        })
      }
      return acc
    }, [] as { id: string, title: string, participants: TeamParticipant[] }[])

  // Group participants by event
  const participantsByEvent = participants
    .filter(p => p.type === 'event')
    .reduce((acc, participant) => {
      if (!participant.event) return acc
      const existing = acc.find(x => x.id === participant.event!.id)
      if (existing) {
        existing.participants.push(participant)
      } else {
        acc.push({
          id: participant.event.id,
          title: participant.event.title,
          participants: [participant]
        })
      }
      return acc
    }, [] as { id: string, title: string, participants: TeamParticipant[] }[])

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t('participants')}</h2>
          <Badge variant="secondary" className="ml-2">
            {participants.length}
          </Badge>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchParticipants')}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">{t('allParticipants')}</TabsTrigger>
          <TabsTrigger value="activities">{t('activities')}</TabsTrigger>
          <TabsTrigger value="events">{t('events')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('member')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead>{t('activities')}</TableHead>
                <TableHead>{t('events')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No participants found
                  </TableCell>
                </TableRow>
              ) : (
                filteredParticipants.map(participant => (
                  <TableRow key={participant.id}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.user?.image || undefined} />
                        <AvatarFallback>{participant.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-sm text-muted-foreground">{participant.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {participant.type === 'event' ? (
                        <Badge variant="outline">{participant.role}</Badge>
                      ) : (
                        <Badge variant="outline">{participant.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {participant.type === 'activity' && participant.activity && (
                        <Badge variant="secondary" className="mr-1">
                          {participant.activity.title}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {participant.type === 'event' && participant.event && (
                        <Badge variant="secondary" className="mr-1">
                          {participant.event.title}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="activities">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('activities')}</TableHead>
                <TableHead>{t('members')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participantsByActivity.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4">
                    No activities found
                  </TableCell>
                </TableRow>
              ) : (
                participantsByActivity.map(activity => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <p className="font-medium">{activity.title}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {activity.participants.map(participant => (
                            <Avatar key={participant.id} className="border-2 border-background">
                              <AvatarImage src={participant.user?.image || undefined} />
                              <AvatarFallback>
                                {participant.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({activity.participants.length})
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="events">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('events')}</TableHead>
                <TableHead>{t('members')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participantsByEvent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                participantsByEvent.map(event => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <p className="font-medium">{event.title}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {event.participants.map(participant => (
                            <Avatar key={participant.id} className="border-2 border-background">
                              <AvatarImage src={participant.user?.image || undefined} />
                              <AvatarFallback>
                                {participant.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({event.participants.length})
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
