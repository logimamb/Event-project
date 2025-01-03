import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, connectToDatabase } from '@/lib/prisma'
import { startOfDay, endOfDay, parseISO, format, startOfMonth, endOfMonth } from 'date-fns'
import { Prisma } from '@prisma/client'

export async function GET(req: Request) {
  try {
    console.log('Starting activities analytics request...')
    
    // Ensure database connection
    const isConnected = await connectToDatabase()
    if (!isConnected) {
      console.error('Failed to connect to database')
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('Session found for user:', session.user.id)

    // Get date range from query params
    const { searchParams } = new URL(req.url)
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    const startDate = fromDate ? startOfDay(parseISO(fromDate)) : startOfMonth(new Date())
    const endDate = toDate ? endOfDay(parseISO(toDate)) : endOfMonth(new Date())

    console.log('Date range:', { startDate, endDate, fromDate, toDate })

    // Get all activities in the date range
    const activities = await prisma.activity.findMany({
      where: {
        userId: session.user.id,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        participants: true,
        event: true
      }
    }).catch((error) => {
      console.error('Prisma query error:', error)
      throw new Error('Database query failed')
    })

    console.log('Found activities:', activities.length)

    // Return empty data if no activities found
    if (!activities || activities.length === 0) {
      console.log('No activities found, returning empty data')
      return NextResponse.json({
        activitiesByStatus: [],
        activityTrends: [],
        participationStats: {
          totalParticipants: 0,
          averageParticipants: 0,
          maxParticipants: 0
        },
        timeDistribution: {
          morning: 0,
          afternoon: 0,
          evening: 0
        },
        statusDistribution: [],
        completionRate: 0
      })
    }

    // Calculate activities by status
    const activitiesByStatus = Object.entries(
      activities.reduce((acc: { [key: string]: number }, activity) => {
        const status = activity.status
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})
    ).map(([name, value]) => ({ name, value }))

    // Calculate monthly trends
    const activityTrends = Object.entries(
      activities.reduce((acc: { [key: string]: { activities: number, participants: number } }, activity) => {
        const month = format(activity.startTime, 'MMM yyyy')
        if (!acc[month]) {
          acc[month] = { activities: 0, participants: 0 }
        }
        acc[month].activities += 1
        acc[month].participants += activity.participants.length
        return acc
      }, {})
    ).map(([month, data]) => ({
      month,
      activities: data.activities,
      participants: data.participants
    }))

    // Calculate participation stats
    const participationStats = activities.reduce(
      (stats, activity) => {
        const participantCount = activity.participants.length
        return {
          totalParticipants: stats.totalParticipants + participantCount,
          averageParticipants: 0, // Calculate after reduction
          maxParticipants: Math.max(stats.maxParticipants, participantCount)
        }
      },
      { totalParticipants: 0, averageParticipants: 0, maxParticipants: 0 }
    )
    participationStats.averageParticipants = Math.round(participationStats.totalParticipants / activities.length)

    // Calculate time distribution
    const timeDistribution = activities.reduce((acc: { morning: number, afternoon: number, evening: number }, activity) => {
      const hour = activity.startTime.getHours()
      if (hour < 12) acc.morning += 1
      else if (hour < 17) acc.afternoon += 1
      else acc.evening += 1
      return acc
    }, { morning: 0, afternoon: 0, evening: 0 })

    // Calculate status distribution
    const statusDistribution = Object.entries(
      activities.reduce((acc: { [key: string]: number }, activity) => {
        acc[activity.status] = (acc[activity.status] || 0) + 1
        return acc
      }, {})
    ).map(([status, count]) => ({
      status,
      count
    }))

    // Calculate completion rate
    const completedActivities = activities.filter(activity => activity.status === 'COMPLETED').length
    const completionRate = (completedActivities / activities.length) * 100

    const response = {
      activitiesByStatus,
      activityTrends,
      participationStats,
      timeDistribution,
      statusDistribution,
      completionRate
    }

    console.log('Sending response:', JSON.stringify(response))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in activities analytics route:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch activity analytics: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
