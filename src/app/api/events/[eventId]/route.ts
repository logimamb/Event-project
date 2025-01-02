import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const event = await prisma.event.findUnique({
      where: {
        id: params.eventId,
      },
      select: {
        userId: true,
      },
    })

    if (!event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    if (event.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    await prisma.event.delete({
      where: {
        id: params.eventId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting event:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()

    // Check event ownership or admin status
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: params.eventId,
        OR: [
          { userId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
                role: { in: ['OWNER', 'ADMIN'] }
              }
            }
          }
        ]
      },
      include: {
        highlights: true
      }
    })

    if (!existingEvent) {
      return new NextResponse('Event not found or unauthorized', { status: 404 })
    }

    // Create location if provided
    let locationId: string | undefined = undefined
    if (body.location) {
      const location = await prisma.location.create({
        data: {
          name: body.location.name || 'Event Location',
          address: body.location.address,
          city: body.location.city,
          state: body.location.state,
          country: body.location.country,
          postalCode: body.location.postalCode,
        }
      })
      locationId = location.id
    }

    // Delete existing highlights
    if (existingEvent.highlights.length > 0) {
      await prisma.highlight.deleteMany({
        where: {
          eventId: params.eventId
        }
      })
    }

    // Update the event with new data
    const updatedEvent = await prisma.event.update({
      where: {
        id: params.eventId
      },
      data: {
        title: body.title,
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
        status: body.status || 'DRAFT',
        priority: body.priority || 'MEDIUM',
        maxAttendees: typeof body.capacity === 'number' ? body.capacity : null,
        isPublic: body.isPublic,
        locationId: locationId || body.locationId,
        highlights: body.highlights ? {
          create: body.highlights.map((highlight: { text: string }) => ({
            text: highlight.text
          }))
        } : undefined,
      },
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

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Error updating event:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
