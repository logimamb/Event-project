import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, connectToDatabase } from '@/lib/prisma'
import { startOfDay, endOfDay, parseISO, format, startOfMonth, endOfMonth, differenceInMinutes } from 'date-fns'
import { Prisma } from '@prisma/client'

export async function GET(req: Request) {
  try {
    console.log('Starting wait time analytics request...')
    
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

    // Get all activities with wait times
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

    if (!activities || activities.length === 0) {
      return NextResponse.json({
        averageWaitTime: 0,
        waitTimeDistribution: [],
        waitTimeByDay: [],
        waitTimeByStatus: [],
        waitTimeStats: {
          min: 0,
          max: 0,
          median: 0,
          total: 0
        },
        peakWaitTimes: {
          morning: 0,
          afternoon: 0,
          evening: 0
        }
      })
    }

    // Calculate wait times for each activity
    const waitTimes = activities.map(activity => {
      const waitTime = activity.createdAt ? differenceInMinutes(activity.startTime, activity.createdAt) : 0
      return {
        id: activity.id,
        waitTime,
        status: activity.status,
        startHour: activity.startTime.getHours(),
        day: format(activity.startTime, 'EEEE'), // Day of week
        date: format(activity.startTime, 'yyyy-MM-dd')
      }
    })

    // Calculate average wait time
    const averageWaitTime = Math.round(
      waitTimes.reduce((sum, item) => sum + item.waitTime, 0) / waitTimes.length
    )

    // Calculate wait time distribution (in ranges)
    const waitTimeRanges = [
      { range: '0-15 min', min: 0, max: 15 },
      { range: '15-30 min', min: 15, max: 30 },
      { range: '30-60 min', min: 30, max: 60 },
      { range: '1-2 hours', min: 60, max: 120 },
      { range: '2+ hours', min: 120, max: Infinity }
    ]

    const waitTimeDistribution = waitTimeRanges.map(range => ({
      name: range.range,
      value: waitTimes.filter(wt => 
        wt.waitTime >= range.min && wt.waitTime < range.max
      ).length
    }))

    // Calculate wait time by day of week
    const waitTimeByDay = Object.entries(
      waitTimes.reduce((acc: { [key: string]: { total: number, count: number } }, wt) => {
        if (!acc[wt.day]) {
          acc[wt.day] = { total: 0, count: 0 }
        }
        acc[wt.day].total += wt.waitTime
        acc[wt.day].count += 1
        return acc
      }, {})
    ).map(([day, data]) => ({
      day,
      average: Math.round(data.total / data.count)
    }))

    // Calculate wait time by status
    const waitTimeByStatus = Object.entries(
      waitTimes.reduce((acc: { [key: string]: { total: number, count: number } }, wt) => {
        if (!acc[wt.status]) {
          acc[wt.status] = { total: 0, count: 0 }
        }
        acc[wt.status].total += wt.waitTime
        acc[wt.status].count += 1
        return acc
      }, {})
    ).map(([status, data]) => ({
      status,
      average: Math.round(data.total / data.count)
    }))

    // Calculate wait time statistics
    const sortedWaitTimes = [...waitTimes].sort((a, b) => a.waitTime - b.waitTime)
    const waitTimeStats = {
      min: sortedWaitTimes[0].waitTime,
      max: sortedWaitTimes[sortedWaitTimes.length - 1].waitTime,
      median: sortedWaitTimes[Math.floor(sortedWaitTimes.length / 2)].waitTime,
      total: sortedWaitTimes.reduce((sum, wt) => sum + wt.waitTime, 0)
    }

    // Calculate peak wait times
    const peakWaitTimes = waitTimes.reduce((acc: { morning: number, afternoon: number, evening: number }, wt) => {
      if (wt.startHour < 12) acc.morning += wt.waitTime
      else if (wt.startHour < 17) acc.afternoon += wt.waitTime
      else acc.evening += wt.waitTime
      return acc
    }, { morning: 0, afternoon: 0, evening: 0 })

    const response = {
      averageWaitTime,
      waitTimeDistribution,
      waitTimeByDay,
      waitTimeByStatus,
      waitTimeStats,
      peakWaitTimes
    }

    console.log('Sending response:', JSON.stringify(response))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in wait time analytics route:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch wait time analytics: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
