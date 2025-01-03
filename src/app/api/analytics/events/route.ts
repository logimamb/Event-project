import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, connectToDatabase } from '@/lib/prisma'
import { startOfDay, endOfDay, parseISO, format, startOfMonth, endOfMonth } from 'date-fns'
import { Prisma } from '@prisma/client'

export async function GET(req: Request) {
  try {
    console.log('Starting analytics request...')
    
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

    // Get all events in the date range
    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        startDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        members: true
      }
    }).catch((error) => {
      console.error('Prisma query error:', error)
      throw new Error('Database query failed')
    })

    console.log('Found events:', events.length)

    // Return empty data if no events found
    if (!events || events.length === 0) {
      console.log('No events found, returning empty data')
      return NextResponse.json({
        eventsByCategory: [],
        eventTrends: [],
        timeSlotDistribution: {
          morning: 0,
          afternoon: 0,
          evening: 0
        },
        averageDurationByType: []
      })
    }

    // Calculate event distribution by category (using status as category)
    const eventsByCategory = Object.entries(
      events.reduce((acc: { [key: string]: number }, event) => {
        const category = event.status.toString() // Convert enum to string
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})
    ).map(([name, value]) => ({ name, value }))

    // Calculate monthly trends
    const eventTrends = Object.entries(
      events.reduce((acc: { [key: string]: { events: number, attendees: number } }, event) => {
        const month = format(event.startDate, 'MMM yyyy')
        if (!acc[month]) {
          acc[month] = { events: 0, attendees: 0 }
        }
        acc[month].events += 1
        acc[month].attendees += event.members.length
        return acc
      }, {})
    ).map(([month, data]) => ({
      month,
      events: data.events,
      attendees: data.attendees
    }))

    // Calculate time slot distribution
    const timeSlotDistribution = events.reduce((acc: { morning: number, afternoon: number, evening: number }, event) => {
      const hour = event.startDate.getHours()
      if (hour < 12) acc.morning += 1
      else if (hour < 17) acc.afternoon += 1
      else acc.evening += 1
      return acc
    }, { morning: 0, afternoon: 0, evening: 0 })

    // Calculate average duration by type
    const averageDurationByType = Object.entries(
      events.reduce((acc: { [key: string]: { total: number, count: number } }, event) => {
        const type = event.status.toString() // Convert enum to string
        const duration = (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60) // duration in hours
        if (!acc[type]) {
          acc[type] = { total: 0, count: 0 }
        }
        acc[type].total += duration
        acc[type].count += 1
        return acc
      }, {})
    ).map(([type, data]) => ({
      type,
      duration: Math.round((data.total / data.count) * 100) / 100 // Round to 2 decimal places
    }))

    const response = {
      eventsByCategory,
      eventTrends,
      timeSlotDistribution,
      averageDurationByType
    }

    console.log('Sending response:', JSON.stringify(response))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in analytics route:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch event analytics: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
