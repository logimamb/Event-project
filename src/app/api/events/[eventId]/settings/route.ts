import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { status, visibility, priority } = await request.json()
    const eventId = params.eventId

    // Verify event ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true }
    })

    if (!event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    if (event.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Validate status
    if (status && !['DRAFT', 'PUBLISHED', 'CANCELLED'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 })
    }

    // Validate visibility and convert to isPublic
    if (visibility && !['PUBLIC', 'PRIVATE'].includes(visibility)) {
      return new NextResponse('Invalid visibility', { status: 400 })
    }

    // Validate priority
    if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      return new NextResponse('Invalid priority', { status: 400 })
    }

    // Update event settings
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(status && { status }),
        ...(visibility && { isPublic: visibility === 'PUBLIC' }),
        ...(priority && { priority }),
      },
      select: {
        id: true,
        status: true,
        isPublic: true,
        priority: true,
      }
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Error updating event settings:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
