'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

const activities = [
  {
    id: 1,
    user: {
      name: 'John Doe',
      image: 'https://api.dicebear.com/7.x/avatars/svg?seed=John',
      initials: 'JD',
    },
    action: 'created a new event',
    event: 'Team Planning Meeting',
    time: '2 hours ago',
  },
  {
    id: 2,
    user: {
      name: 'Jane Smith',
      image: 'https://api.dicebear.com/7.x/avatars/svg?seed=Jane',
      initials: 'JS',
    },
    action: 'updated',
    event: 'Product Launch',
    time: '4 hours ago',
  },
  {
    id: 3,
    user: {
      name: 'Mike Johnson',
      image: 'https://api.dicebear.com/7.x/avatars/svg?seed=Mike',
      initials: 'MJ',
    },
    action: 'cancelled',
    event: 'Client Meeting',
    time: '6 hours ago',
  },
  {
    id: 4,
    user: {
      name: 'Sarah Wilson',
      image: 'https://api.dicebear.com/7.x/avatars/svg?seed=Sarah',
      initials: 'SW',
    },
    action: 'joined',
    event: 'Team Building Event',
    time: '12 hours ago',
  },
  {
    id: 5,
    user: {
      name: 'David Brown',
      image: 'https://api.dicebear.com/7.x/avatars/svg?seed=David',
      initials: 'DB',
    },
    action: 'commented on',
    event: 'Project Review',
    time: '1 day ago',
  },
]

export function RecentActivity() {
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={activity.user.image} alt={activity.user.name} />
              <AvatarFallback>{activity.user.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>
                {' '}
                <span className="text-muted-foreground">{activity.action}</span>
                {' '}
                <span className="font-medium">{activity.event}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
