'use client'

import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'

const recentEvents = [
  {
    id: 1,
    title: 'Team Planning Meeting',
    date: '2024-01-02',
    time: '10:00 AM',
    location: 'Conference Room A',
    attendees: 8,
    status: 'upcoming',
  },
  {
    id: 2,
    title: 'Product Launch',
    date: '2024-01-05',
    time: '2:00 PM',
    location: 'Main Hall',
    attendees: 50,
    status: 'upcoming',
  },
  {
    id: 3,
    title: 'Client Presentation',
    date: '2024-01-03',
    time: '11:30 AM',
    location: 'Virtual Meeting',
    attendees: 12,
    status: 'draft',
  },
  {
    id: 4,
    title: 'Team Building Event',
    date: '2024-01-10',
    time: '9:00 AM',
    location: 'City Park',
    attendees: 25,
    status: 'upcoming',
  },
]

export function RecentEvents() {
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-6">
        {recentEvents.map((event) => (
          <div key={event.id} className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{event.title}</h4>
              <Badge 
                variant={event.status === 'upcoming' ? 'default' : 'secondary'}
              >
                {event.status}
              </Badge>
            </div>
            <div className="grid gap-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                {event.date}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                {event.time}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {event.location}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                {event.attendees} attendees
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
