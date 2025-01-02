import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { activitySchema } from '@/lib/validations/activity'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

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
    { error: 'An unexpected error occurred.' },
    { status: 500 }
  )
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = activitySchema.parse(body)
    
    // Check if user is event creator or has access to the event
    const event = await prisma.event.findUnique({
      where: {
        id: validatedData.eventId,
      },
      select: {
        userId: true,
        members: {
          where: {
            userId: session.user.id,
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const isCreator = event.userId === session.user.id
    const isMember = event.members.length > 0

    if (!isCreator && !isMember) {
      return NextResponse.json(
        { error: 'You do not have permission to create activities for this event' },
        { status: 403 }
      )
    }
    
    const activity = await prisma.activity.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        location: validatedData.location,
        capacity: validatedData.capacity,
        status: 'PENDING',
        eventId: validatedData.eventId,
        userId: session.user.id,
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
          }
        },
        participants: {
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

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Failed to create activity:', error)
    
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
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get activities where user is either the creator or a participant
    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          {
            participants: {
              some: {
                userId: session.user.id
              }
            }
          },
          {
            event: {
              OR: [
                { userId: session.user.id },
                {
                  members: {
                    some: {
                      userId: session.user.id
                    }
                  }
                }
              ]
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
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return handleDatabaseError(error)
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      )
    }

    // Check if user has permission to update the activity
    const activity = await prisma.activity.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { event: { members: { some: { userId: session.user.id } } } }
        ]
      },
      include: {
        event: {
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (activity.userId !== session.user.id && !activity.event.members.length) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const validatedData = activitySchema.parse(updateData)

    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        location: validatedData.location,
        capacity: validatedData.capacity,
        status: validatedData.status,
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
          }
        },
        participants: {
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

    return NextResponse.json(updatedActivity)
  } catch (error) {
    console.error('Failed to update activity:', error)
    
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
      { error: 'Failed to update activity' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      )
    }

    // Check if user has permission to delete the activity
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            EventMember: {
              where: {
                userId: session.user.id
              }
            }
          }
        }
      }
    })

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      )
    }

    if (activity.userId !== session.user.id && !activity.event.EventMember.length) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this activity' },
        { status: 403 }
      )
    }

    await prisma.activity.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete activity:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    )
  }
} 