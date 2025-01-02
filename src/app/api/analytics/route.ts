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

    // Fetch current period metrics
    const [
      currentPeriodEvents,
      currentPeriodActivities,
      currentPeriodParticipants
    ] = await Promise.all([
      // Events in current period
      prisma.event.findMany({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          _count: {
            select: {
              members: true,
              activities: true
            }
          }
        }
      }),
      // Activities in current period
      prisma.activity.findMany({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          _count: {
            select: {
              participants: true
            }
          }
        }
      }),
      // Participants in current period
      prisma.eventMember.findMany({
        where: {
          event: {
            userId: session.user.id,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        include: {
          user: true
        }
      })
    ])

    // Fetch previous period metrics for comparison
    const [
      previousPeriodEventCount,
      previousPeriodActivityCount,
      previousPeriodParticipantCount
    ] = await Promise.all([
      prisma.event.count({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        }
      }),
      prisma.activity.count({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        }
      }),
      prisma.eventMember.count({
        where: {
          event: {
            userId: session.user.id,
            createdAt: {
              gte: previousPeriodStart,
              lte: previousPeriodEnd
            }
          }
        }
      })
    ])

    // Calculate growth rates
    const calculateGrowthRate = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    // Get upcoming and completed events
    const [upcomingEvents, completedEvents] = await Promise.all([
      prisma.event.count({
        where: {
          userId: session.user.id,
          startDate: {
            gt: new Date()
          }
        }
      }),
      prisma.event.count({
        where: {
          userId: session.user.id,
          endDate: {
            lt: new Date()
          }
        }
      })
    ])

    // Get activities by status
    const activitiesByStatus = await prisma.activity.groupBy({
      by: ['status'],
      where: {
        userId: session.user.id,
        createdAt: {
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
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    })

    // Get popular locations
    const popularLocations = await prisma.event.groupBy({
      by: ['location'],
      where: {
        userId: session.user.id,
        location: { not: null },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true,
      orderBy: {
        _count: {
          location: 'desc'
        }
      },
      take: 5
    })

    // Get participation trends (daily)
    const participationTrends = await prisma.eventMember.groupBy({
      by: ['createdAt'],
      where: {
        event: {
          userId: session.user.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      _count: true,
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get top events
    const topEvents = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        _count: {
          select: {
            members: true,
            activities: true
          }
        }
      },
      orderBy: {
        members: {
          _count: 'desc'
        }
      },
      take: 5
    })

    // Calculate current period totals
    const totalEvents = currentPeriodEvents.length
    const totalActivities = currentPeriodActivities.length
    const totalParticipants = currentPeriodParticipants.length
    const activeActivities = activitiesByStatus.find(status => status.status === 'IN_PROGRESS')?._count || 0
    const completedActivities = activitiesByStatus.find(status => status.status === 'COMPLETED')?._count || 0

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
          participants: calculateGrowthRate(totalParticipants, previousPeriodParticipantCount)
        }
      },
      charts: {
        popularLocations: popularLocations.map(loc => ({
          name: loc.location || 'No location',
          value: loc._count
        })),
        eventsByStatus: eventsByStatus.map(status => ({
          name: status.status,
          value: status._count
        })),
        activitiesByStatus: activitiesByStatus.map(status => ({
          name: status.status,
          value: status._count
        })),
        participationTrends: participationTrends.map(trend => ({
          date: trend.createdAt.toISOString(),
          participants: trend._count
        })),
        topEvents: topEvents.map(event => ({
          name: event.title,
          participants: event._count.members,
          activities: event._count.activities
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
