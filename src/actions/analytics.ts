import { prisma } from '@/lib/prisma'
import { DateRange } from 'react-day-picker'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export interface AnalyticsData {
  totalEvents: number
  totalAttendees: number
  activitiesCompleted: number
  averageAttendance: number
  activeEvents: number
  growthRate: number
  averageDuration: string
  successRate: number
  activityProgress: {
    status: string
    count: number
    percentage: number
  }[]
  attendeeEngagement: {
    subject: string
    A: number
    fullMark: number
  }[]
  eventTrends: {
    name: string
    total: number
  }[]
  eventsByStatus: {
    status: string
    count: number
  }[]
  eventsByPriority: {
    priority: string
    count: number
  }[]
  recentEvents: {
    id: string
    title: string
    startDate: Date
    attendeeCount: number
    status: string
  }[]
  topLocations: {
    location: string | null
    count: number
  }[]
}

export async function getAnalytics(dateRange: DateRange | null): Promise<AnalyticsData> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const startDate = dateRange?.from || new Date(new Date().setMonth(new Date().getMonth() - 1))
  const endDate = dateRange?.to || new Date()

  // Get total events
  const totalEvents = await prisma.event.count({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  // Get total attendees
  const eventMembers = await prisma.eventMember.count({
    where: {
      event: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
  })

  // Get completed activities
  const completedActivities = await prisma.activity.count({
    where: {
      userId: session.user.id,
      status: 'COMPLETED',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  // Get active events
  const activeEvents = await prisma.event.count({
    where: {
      userId: session.user.id,
      status: 'PUBLISHED',
      startDate: {
        lte: new Date(),
      },
      endDate: {
        gte: new Date(),
      },
    },
  })

  // Calculate growth rate
  const previousPeriodStart = new Date(startDate)
  previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
  const previousPeriodEvents = await prisma.event.count({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: previousPeriodStart,
        lt: startDate,
      },
    },
  })

  const growthRate = previousPeriodEvents === 0
    ? totalEvents * 100
    : ((totalEvents - previousPeriodEvents) / previousPeriodEvents) * 100

  // Get events by status
  const eventsByStatus = await prisma.event.groupBy({
    by: ['status'],
    where: {
      userId: session.user.id,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
  })

  // Get events by priority
  const eventsByPriority = await prisma.event.groupBy({
    by: ['priority'],
    where: {
      userId: session.user.id,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
  })

  // Get recent events with attendee count
  const recentEvents = await prisma.event.findMany({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      title: true,
      startDate: true,
      status: true,
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      startDate: 'desc',
    },
    take: 5,
  })

  // Get top locations
  const topLocations = await prisma.event.groupBy({
    by: ['location'],
    where: {
      userId: session.user.id,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
    orderBy: {
      _count: {
        _all: 'desc',
      },
    },
    take: 5,
  })

  // Calculate average duration
  const events = await prisma.event.findMany({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      startDate: true,
      endDate: true,
    },
  })

  const totalDurationHours = events.reduce((acc, event) => {
    const duration = event.endDate.getTime() - event.startDate.getTime()
    return acc + (duration / (1000 * 60 * 60)) // Convert to hours
  }, 0)

  const averageDuration = events.length > 0
    ? `${Math.round(totalDurationHours / events.length)} hours`
    : '0 hours'

  // Calculate success rate (completed events / total events)
  const completedEvents = eventsByStatus.find(e => e.status === 'COMPLETED')?._count || 0
  const successRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0

  // Get activity progress
  const activityProgress = await prisma.activity.groupBy({
    by: ['status'],
    where: {
      userId: session.user.id,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
  })

  const totalActivities = activityProgress.reduce((acc, curr) => acc + curr._count, 0)

  return {
    totalEvents,
    totalAttendees: eventMembers,
    activitiesCompleted: completedActivities,
    averageAttendance: totalEvents > 0 ? Math.round(eventMembers / totalEvents) : 0,
    activeEvents,
    growthRate,
    averageDuration,
    successRate,
    activityProgress: activityProgress.map(status => ({
      status: status.status,
      count: status._count,
      percentage: totalActivities > 0 ? (status._count / totalActivities) * 100 : 0,
    })),
    attendeeEngagement: [
      { subject: 'Events', A: totalEvents, fullMark: totalEvents },
      { subject: 'Attendees', A: eventMembers, fullMark: eventMembers * 1.5 },
      { subject: 'Activities', A: completedActivities, fullMark: completedActivities * 1.5 },
      { subject: 'Active', A: activeEvents, fullMark: activeEvents * 1.5 },
    ],
    eventTrends: [
      { name: 'Total Events', total: totalEvents },
      { name: 'Active Events', total: activeEvents },
      { name: 'Completed Events', total: completedEvents },
      { name: 'Total Attendees', total: eventMembers },
    ],
    eventsByStatus: eventsByStatus.map(status => ({
      status: status.status,
      count: status._count,
    })),
    eventsByPriority: eventsByPriority.map(priority => ({
      priority: priority.priority,
      count: priority._count,
    })),
    recentEvents: recentEvents.map(event => ({
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      attendeeCount: event._count.members,
      status: event.status,
    })),
    topLocations: topLocations.map(location => ({
      location: location.location,
      count: location._count._all,
    })),
  }
}
