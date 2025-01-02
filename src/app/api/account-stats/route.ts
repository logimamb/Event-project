import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch account overview
    const [
      user,
      totalEvents,
      totalActivities,
      totalParticipations,
      eventsCreated,
      activitiesJoined,
      eventsJoined
    ] = await Promise.all([
      // Get user details
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true
        }
      }),

      // Total events created
      prisma.event.count({
        where: { userId: session.user.id }
      }),

      // Total activities created
      prisma.activity.count({
        where: { userId: session.user.id }
      }),

      // Total participations in activities
      prisma.activityParticipant.count({
        where: { userId: session.user.id }
      }),

      // Events created with details
      prisma.event.findMany({
        where: { userId: session.user.id },
        include: {
          _count: {
            select: {
              members: true,
              activities: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Activities participated in
      prisma.activityParticipant.findMany({
        where: { userId: session.user.id },
        include: {
          activity: {
            include: {
              event: {
                select: {
                  title: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Events joined as member
      prisma.eventMember.findMany({
        where: { userId: session.user.id },
        include: {
          event: {
            include: {
              _count: {
                select: {
                  members: true,
                  activities: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Get event statistics
    const eventStats = {
      total: totalEvents,
      byStatus: await prisma.event.groupBy({
        by: ['status'],
        where: { userId: session.user.id },
        _count: true
      }),
      recentEvents: eventsCreated.slice(0, 5),
      joinedEvents: eventsJoined.map(membership => ({
        ...membership.event,
        joinedAt: membership.createdAt
      })).slice(0, 5)
    }

    // Get activity statistics
    const activityStats = {
      total: totalActivities,
      byStatus: await prisma.activity.groupBy({
        by: ['status'],
        where: { userId: session.user.id },
        _count: true
      }),
      recentActivities: await prisma.activity.findMany({
        where: { userId: session.user.id },
        include: {
          event: {
            select: {
              title: true
            }
          },
          _count: {
            select: {
              participants: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      joinedActivities: activitiesJoined.slice(0, 5)
    }

    // Calculate participation stats
    const participationStats = {
      totalParticipations,
      eventsJoinedCount: eventsJoined.length,
      activitiesJoinedCount: activitiesJoined.length,
      averageParticipantsInEvents: eventsCreated.reduce((acc, event) => 
        acc + event._count.members, 0) / (eventsCreated.length || 1),
      averageActivitiesPerEvent: eventsCreated.reduce((acc, event) => 
        acc + event._count.activities, 0) / (eventsCreated.length || 1)
    }

    return NextResponse.json({
      overview: {
        user,
        joinDate: user?.createdAt,
        totalEvents,
        totalActivities,
        totalParticipations,
        ...participationStats
      },
      eventStats,
      activityStats
    })
  } catch (error) {
    console.error('Account stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account statistics' },
      { status: 500 }
    )
  }
}
