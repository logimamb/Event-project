import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, parseISO, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get date range from query params
    const { searchParams } = new URL(req.url)
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    const startDate = fromDate ? startOfDay(parseISO(fromDate)) : startOfMonth(new Date())
    const endDate = toDate ? endOfDay(parseISO(toDate)) : endOfMonth(new Date())
    const previousPeriodStart = subMonths(startDate, 1)
    const previousPeriodEnd = subMonths(endDate, 1)

    // Get events for the current period
    const currentPeriodEvents = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        startDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        members: true,
        activities: true
      }
    })

    // Get activities for the current period
    const currentPeriodActivities = await prisma.activity.findMany({
      where: {
        userId: session.user.id,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        participants: true
      }
    })

    // Get previous period counts
    const previousPeriodEventCount = await prisma.event.count({
      where: {
        userId: session.user.id,
        startDate: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    })

    const previousPeriodActivityCount = await prisma.activity.count({
      where: {
        userId: session.user.id,
        startTime: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    })

    // Get upcoming and completed events
    const upcomingEvents = await prisma.event.count({
      where: {
        userId: session.user.id,
        startDate: {
          gt: new Date()
        }
      }
    })

    const completedEvents = await prisma.event.count({
      where: {
        userId: session.user.id,
        endDate: {
          lt: new Date()
        }
      }
    })

    // Get activities by status
    const activitiesByStatus = await prisma.activity.groupBy({
      by: ['status'],
      where: {
        userId: session.user.id,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    })

    // Get events by status
    const eventsByStatus = await prisma.event.groupBy({
      by: ['status'],
      where: {
        userId: session.user.id,
        startDate: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    })

    // Calculate current period totals
    const totalEvents = currentPeriodEvents.length
    const totalActivities = currentPeriodActivities.length
    const totalParticipants = currentPeriodEvents.reduce((sum, event) => sum + event.members.length, 0)
    const activeActivities = activitiesByStatus.find(status => status.status === 'IN_PROGRESS')?._count || 0
    const completedActivities = activitiesByStatus.find(status => status.status === 'COMPLETED')?._count || 0

    // Calculate previous period participants
    const previousPeriodEvents = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        startDate: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      },
      include: {
        members: true
      }
    })
    const previousPeriodParticipants = previousPeriodEvents.reduce((sum, event) => sum + event.members.length, 0)

    return NextResponse.json({
      overview: {
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalParticipants,
        totalActivities,
        activeActivities,
        completedActivities,
        growthRates: {
          events: calculateGrowthRate(totalEvents, previousPeriodEventCount),
          activities: calculateGrowthRate(totalActivities, previousPeriodActivityCount),
          participants: calculateGrowthRate(totalParticipants, previousPeriodParticipants)
        }
      },
      charts: {
        eventsByStatus: eventsByStatus.map(status => ({
          name: status.status,
          value: status._count
        })),
        activitiesByStatus: activitiesByStatus.map(status => ({
          name: status.status,
          value: status._count
        }))
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}
