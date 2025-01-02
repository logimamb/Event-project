export type ActivityStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Location {
  id: string
  name: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export interface Accessibility {
  id: string
  description: string
  requirements?: string
}

export interface ActivityParticipant {
  id: string
  userId: string
  status: ActivityStatus
  joinedAt: Date
  user: User
}

export interface Activity {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  capacity?: number
  status: ActivityStatus
  eventId: string
  userId: string
  createdAt: string
  updatedAt: string
  event: {
    id: string
    title: string
  }
  user: User
  participants?: ActivityParticipant[]
  accessibility?: Accessibility
}

export interface EventMember {
  id: string
  userId: string
  role: string
  user: User
}

export interface Event {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: Location
  status?: EventStatus
  priority?: Priority
  currentAttendees: number
  maxAttendees?: number
  creatorId: string
  members: EventMember[]
  activities: Activity[]
  _count: {
    activities: number
    members: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface ActivityStats {
  totalActivities: number
  completedActivities: number
  pendingActivities: number
  inProgressActivities: number
  cancelledActivities: number
}

export interface UserStats {
  totalCreatedEvents: number
  totalJoinedEvents: number
  totalActivities: number
  upcomingEvents: number
}

export interface DashboardStats {
  totalEvents: number
  totalActivities: number
  totalParticipants: number
  completionRate: number
  userStats: UserStats
  activityStats: ActivityStats
  recentEvents: Event[]
  recentActivities: Activity[]
}