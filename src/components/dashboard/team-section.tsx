'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Mail, MessageSquare } from 'lucide-react'

const teamMembers = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Team Lead',
    department: 'Engineering',
    email: 'john@example.com',
    image: 'https://api.dicebear.com/7.x/avatars/svg?seed=John',
    initials: 'JD',
    status: 'online',
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Product Manager',
    department: 'Product',
    email: 'jane@example.com',
    image: 'https://api.dicebear.com/7.x/avatars/svg?seed=Jane',
    initials: 'JS',
    status: 'offline',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    role: 'Designer',
    department: 'Design',
    email: 'mike@example.com',
    image: 'https://api.dicebear.com/7.x/avatars/svg?seed=Mike',
    initials: 'MJ',
    status: 'online',
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    role: 'Developer',
    department: 'Engineering',
    email: 'sarah@example.com',
    image: 'https://api.dicebear.com/7.x/avatars/svg?seed=Sarah',
    initials: 'SW',
    status: 'online',
  },
  {
    id: 5,
    name: 'David Brown',
    role: 'Marketing',
    department: 'Marketing',
    email: 'david@example.com',
    image: 'https://api.dicebear.com/7.x/avatars/svg?seed=David',
    initials: 'DB',
    status: 'offline',
  },
]

export function TeamSection() {
  return (
    <ScrollArea className="h-[300px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex flex-col space-y-4 p-4 border rounded-lg bg-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="font-medium leading-none">{member.name}</h4>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <Badge 
                variant={member.status === 'online' ? 'default' : 'secondary'}
                className="ml-auto"
              >
                {member.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Department: {member.department}
              </p>
              <p className="text-sm text-muted-foreground truncate" title={member.email}>
                {member.email}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-8">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="flex-1 h-8">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
