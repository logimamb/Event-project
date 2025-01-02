import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { eventSchema } from '@/lib/validations/event'
import { ZodError } from 'zod'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { generateMemberCode } from '@/lib/utils/memberCode'
import { google } from 'googleapis'

const handleDatabaseError = (error: any) => {
  console.error('Database error:', error)
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'A unique constraint would be violated.' },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          { error: 'Record not found.' },
          { status: 404 }
        )
      case 'P2003':
        return NextResponse.json(
          { error: 'Foreign key constraint failed.' },
          { status: 400 }
        )
      case 'P2028':
        return NextResponse.json(
          { error: 'Database transaction timeout. Please try again.' },
          { status: 503 }
        )
      default:
        return NextResponse.json(
          { error: `Database error: ${error.message}` },
          { status: 400 }
        )
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { error: 'Invalid data provided.' },
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      { error: 'Failed to connect to the database.' },
      { status: 503 }
    )
  }

  return NextResponse.json(
    { error: 'An unexpected database error occurred.' },
    { status: 500 }
  )
}

async function addToGoogleCalendar(event: any, accessToken: string) {
  try {
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const eventData = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startDate,
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.endDate,
        timeZone: 'UTC',
      },
      location: event.location?.address,
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventData,
    })

    return response.data
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error)
    throw error
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to create an event.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = eventSchema.parse(body)
    const priority = validatedData.priority?.toUpperCase() || 'MEDIUM'

    // Create location first if provided
    let locationId: string | undefined
    if (validatedData.location) {
      const location = await prisma.location.create({
        data: {
          name: validatedData.location.name || 'Event Location',
          address: validatedData.location.address,
          city: validatedData.location.city,
          state: validatedData.location.state,
          country: validatedData.location.country,
          postalCode: validatedData.location.postalCode,
        }
      })
      locationId = location.id
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        status: validatedData.status || 'DRAFT',
        priority,
        userId: session.user.id,
        maxAttendees: typeof validatedData.capacity === 'number' ? validatedData.capacity : null,
        isPublic: validatedData.isPublic,
        locationId: locationId || validatedData.locationId,
        highlights: validatedData.highlights ? {
          create: validatedData.highlights.map(highlight => ({
            text: highlight.text
          }))
        } : undefined,
      }
    })

    // Create the owner member record
    await prisma.eventMember.create({
      data: {
        eventId: event.id,
        userId: session.user.id,
        role: 'OWNER',
        permissions: ['MANAGE', 'EDIT', 'VIEW', 'DELETE']
      }
    })

    // Fetch the complete event data with relations
    const completeEvent = await prisma.event.findUnique({
      where: { id: event.id },
      include: {
        location: true,
        highlights: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    })

    // Handle Google Calendar integration
    if (validatedData.addToGoogleCalendar && session.user.googleAccessToken) {
      try {
        await addToGoogleCalendar(completeEvent, session.user.googleAccessToken)
      } catch (error) {
        console.error('Failed to add event to Google Calendar:', error)
        // Continue since event was created successfully
      }
    }

    return NextResponse.json(completeEvent, { status: 201 })
  } catch (error) {
    console.error('Failed to create event:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid event data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handleDatabaseError(error)
    }

    return NextResponse.json(
      { error: 'Failed to create event. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const showAll = searchParams.get('all') === 'true'
    const query = searchParams.get('query')?.toLowerCase()
    const minimal = searchParams.get('minimal') === 'true'

    const where: Prisma.EventWhereInput = {
      OR: [
        { userId: session.user.id },
        { members: { some: { userId: session.user.id } } },
        ...(showAll ? [{ visibility: 'PUBLIC' }] : [])
      ],
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      }),
    }

    if (minimal) {
      const events = await prisma.event.findMany({
        where,
        orderBy: { startDate: 'desc' },
        select: {
          id: true,
          title: true,
        }
      })
      return NextResponse.json(events)
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        location: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          }
        },
        activities: {
          select: {
            id: true,
            title: true,
            status: true,
            startTime: true,
            endTime: true,
          }
        },
        _count: {
          select: {
            activities: true,
            members: true,
          }
        }
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Check if user has permission to update the event
    const member = await prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: session.user.id,
        }
      }
    })

    if (!member || member.role !== 'OWNER') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const validatedData = eventSchema.parse(updateData)

    const priority = validatedData.priority?.toUpperCase() || 'MEDIUM'

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        status: validatedData.status,
        priority,
        capacity: typeof validatedData.capacity === 'number' ? validatedData.capacity : null,
        visibility: validatedData.isPublic ? 'PUBLIC' : 'PRIVATE',
        categoryId: validatedData.categoryId,
        location: validatedData.location ? {
          upsert: {
            create: {
              name: validatedData.location.name || 'Event Location',
              address: validatedData.location.address,
              city: validatedData.location.city,
              state: validatedData.location.state,
              country: validatedData.location.country,
              postalCode: validatedData.location.postalCode,
            },
            update: {
              name: validatedData.location.name || 'Event Location',
              address: validatedData.location.address,
              city: validatedData.location.city,
              state: validatedData.location.state,
              country: validatedData.location.country,
              postalCode: validatedData.location.postalCode,
            }
          }
        } : undefined,
      },
      include: {
        location: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          }
        },
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Failed to update event:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A unique constraint would be violated.' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Check if user has permission to delete the event
    const member = await prisma.eventMember.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: id,
        }
      }
    })

    if (!member || !member.permissions.includes('MANAGE_SETTINGS')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}