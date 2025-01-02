'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export interface ActivityStateStats {
  pending: number
  inProgress: number
  completed: number
  cancelled: number
  total: number
}

export interface DashboardStats {
  totalEvents: number
  totalActivities: number
  totalParticipants: number
  completionRate: number
  recentEvents: any[]
  recentActivities: any[]
  activityStats: ActivityStateStats
  userStats: {
    totalCreatedEvents: number
    totalJoinedEvents: number
    upcomingEvents: number
  }
}

const defaultStats: DashboardStats = {
  totalEvents: 0,
  totalActivities: 0,
  totalParticipants: 0,
  completionRate: 0,
  recentEvents: [],
  recentActivities: [],
  activityStats: {
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  },
  userStats: {
    totalCreatedEvents: 0,
    totalJoinedEvents: 0,
    upcomingEvents: 0
  }
}

async function getUserEvents(userId: string | undefined | null) {
  if (!userId || typeof userId !== 'string') {
    return {
      createdEvents: [],
      memberEvents: []
    }
  }

  const [createdEvents, memberEvents] = await Promise.all([
    prisma.event.findMany({
      where: {
        userId: userId 
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        activities: {
          select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            status: true,
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true
                  }
                }
              }
            }
          },
          orderBy: {
            startTime: "asc"
          }
        },
        creatorId: { 
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            activities: true,
            members: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    }),
    prisma.event.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        },
        NOT: {
          userId: userId 
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        activities: {
          select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            status: true,
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true
                  }
                }
              }
            }
          },
          orderBy: {
            startTime: "asc"
          }
        },
        creatorId: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            activities: true,
            members: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    })
  ])

  return {
    createdEvents,
    memberEvents
  }
}

async function getUserActivities(userId: string | undefined | null) {
  if (!userId) return []

  return prisma.activity.findMany({
    where: {
      OR: [
        {
          userId: userId
        },
        {
          participants: {
            some: {
              userId: userId
            }
          }
        }
      ]
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true
        }
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      }
    },
    orderBy: {
      startTime: "asc"
    },
    take: 5
  })
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const userId = session.user.id

  try {
    const [activities, { createdEvents, memberEvents }, totalEventsCount, totalMembers] = await Promise.all([
      getUserActivities(userId),
      getUserEvents(userId),
      prisma.event.count({
        where: {
          OR: [
            {
              userId: userId 
            },
            {
              members: {
                some: {
                  userId: userId
                }
              }
            }
          ]
        }
      }),
      prisma.eventMember.count({
        where: {
          event: {
            userId: userId 
          }
        }
      })
    ])

    const activityStats = activities.reduce(
      (stats, activity) => {
        const status = activity.status.toLowerCase()
        if (status === 'pending') stats.pending++
        if (status === 'in_progress') stats.inProgress++
        if (status === 'completed') stats.completed++
        if (status === 'cancelled') stats.cancelled++
        stats.total++
        return stats
      },
      { pending: 0, inProgress: 0, completed: 0, cancelled: 0, total: 0 }
    )

    const completionRate =
      activityStats.total > 0
        ? Math.round((activityStats.completed / activityStats.total) * 100)
        : 0

    return {
      totalEvents: totalEventsCount,
      totalActivities: activityStats.total,
      totalParticipants: totalMembers,
      completionRate,
      recentEvents: [...createdEvents, ...memberEvents]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),
      recentActivities: activities,
      activityStats,
      userStats: {
        totalCreatedEvents: createdEvents.length,
        totalJoinedEvents: memberEvents.length,
        totalActivities: activityStats.total,
        upcomingEvents: createdEvents.filter(
          (event) => new Date(event.startDate) > new Date()
        ).length
      }
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return defaultStats
  }
}