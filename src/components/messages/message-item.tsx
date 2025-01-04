import { format } from 'date-fns'
import { Session } from 'next-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Archive, AlertCircle, CheckSquare, Users, Flag, Calendar, Paperclip, Bell, MessageSquare } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

interface Message {
  id: string
  content: string
  subject: string
  type: 'DIRECT' | 'TEAM' | 'ANNOUNCEMENT' | 'TASK' | 'EVENT' | 'REMINDER' | 'FEEDBACK'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  category: 'GENERAL' | 'PROJECT' | 'MEETING' | 'TASK' | 'EVENT' | 'FEEDBACK' | 'APPROVAL' | 'REPORT' | 'ANNOUNCEMENT' | 'QUESTION'
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'DELIVERED' | 'READ' | 'ARCHIVED' | 'DELETED'
  teamId?: string
  dueDate?: Date
  reminderDate?: Date
  isArchived: boolean
  isStarred: boolean
  isScheduled: boolean
  scheduledFor?: Date
  attachments: {
    id: string
    filename: string
    fileType: string
    fileSize: number
    url: string
  }[]
  labels: {
    id: string
    name: string
    color: string
    icon?: string
  }[]
  readBy: {
    id: string
    userId: string
    readAt: Date
    deviceType?: string
    deviceInfo?: string
  }[]
  createdAt: Date
  sender: User
  receiver: User
  fromUser?: User
  toUser?: User
}

interface MessageItemProps {
  message: Message
  session: Session | null
  onStar: () => void
  onArchive: () => void
}

function getInitials(name: string | null) {
  if (!name) return '??'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

// Function to strip HTML tags and format the content
function formatMessageContent(content: string): string {
  // First, extract key information using regex
  const dateMatch = content.match(/Date: ([^<]+)/);
  const timeMatch = content.match(/Time: ([^<]+)/);
  const locationMatch = content.match(/Location: ([^<]+)/);
  const codeMatch = content.match(/participation code is: ([^<]+)/);

  // If this is an activity invitation (contains these patterns), format it nicely
  if (dateMatch || timeMatch || locationMatch) {
    const parts = [];
    if (dateMatch) parts.push(`Date: ${dateMatch[1].trim()}`);
    if (timeMatch) parts.push(`Time: ${timeMatch[1].trim()}`);
    if (locationMatch) parts.push(`Location: ${locationMatch[1].trim()}`);
    if (codeMatch) parts.push(`Code: ${codeMatch[1].trim()}`);
    
    return parts.join(' • ');
  }

  // For other messages, just strip HTML tags
  return content
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

export function MessageItem({ message, session, onStar, onArchive }: MessageItemProps) {
  const sender = message.fromUser || message.sender
  const receiver = message.toUser || message.receiver
  const isCurrentUserSender = sender?.id === session?.user?.id
  const otherUser = isCurrentUserSender ? receiver : sender

  const formattedContent = formatMessageContent(message.content)

  return (
    <div className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <Avatar className="hidden sm:block">
          <AvatarImage src={otherUser?.image || undefined} alt={otherUser?.name || 'User'} />
          <AvatarFallback>{getInitials(otherUser?.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold truncate">{otherUser?.name}</span>
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <span className="text-sm text-muted-foreground truncate hidden sm:block">
                {format(new Date(message.createdAt), 'PPp')}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100", 
                  message.isStarred && "text-yellow-500")}
                onClick={onStar}
              >
                <Star className={cn("h-4 w-4", message.isStarred && "fill-current")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100"
                onClick={onArchive}
              >
                <Archive className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {message.type !== 'DIRECT' && (
              <Badge 
                variant="outline" 
                className={cn(
                  "gap-1 text-xs",
                  {
                    'border-yellow-500 text-yellow-500': message.type === 'ANNOUNCEMENT',
                    'border-blue-500 text-blue-500': message.type === 'TASK',
                    'border-purple-500 text-purple-500': message.type === 'TEAM',
                    'border-green-500 text-green-500': message.type === 'EVENT',
                    'border-orange-500 text-orange-500': message.type === 'REMINDER',
                    'border-pink-500 text-pink-500': message.type === 'FEEDBACK'
                  }
                )}
              >
                {getTypeIcon(message.type)}
                <span className="hidden sm:inline">{message.type.toLowerCase()}</span>
              </Badge>
            )}
            {message.priority && (
              <Badge 
                variant="outline" 
                className={cn(
                  "gap-1 text-xs",
                  {
                    'border-red-500 text-red-500': message.priority === 'HIGH',
                    'border-yellow-500 text-yellow-500': message.priority === 'MEDIUM',
                    'border-green-500 text-green-500': message.priority === 'LOW'
                  }
                )}
              >
                <Flag className="h-3 w-3" />
                <span className="hidden sm:inline">{message.priority.toLowerCase()}</span>
              </Badge>
            )}
            {message.category && (
              <Badge variant="outline" className="gap-1 text-xs hidden sm:flex">
                {message.category.toLowerCase()}
              </Badge>
            )}
          </div>
          <div className="font-medium">{message.subject}</div>
          <p className="text-sm text-muted-foreground line-clamp-2">{formattedContent}</p>
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Paperclip className="h-4 w-4" />
              <span>{message.attachments.length} attachments</span>
            </div>
          )}
          <span className="text-sm text-muted-foreground block sm:hidden">
            {format(new Date(message.createdAt), 'PPp')}
          </span>
        </div>
      </div>
    </div>
  )
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'ANNOUNCEMENT':
      return <AlertCircle className="h-3 w-3" />
    case 'TASK':
      return <CheckSquare className="h-3 w-3" />
    case 'TEAM':
      return <Users className="h-3 w-3" />
    case 'EVENT':
      return <Calendar className="h-3 w-3" />
    case 'REMINDER':
      return <Bell className="h-3 w-3" />
    case 'FEEDBACK':
      return <MessageSquare className="h-3 w-3" />
    default:
      return null
  }
}
