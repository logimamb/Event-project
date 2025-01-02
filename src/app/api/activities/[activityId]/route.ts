import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { activitySchema } from '@/lib/validations/activity'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  req: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const requestData = await req.json()
    let updateData: any = {}
    
    // If this is a status update
    if ('status' in requestData && Object.keys(requestData).length === 1) {
      if (!['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(requestData.status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        )
      }
      updateData = { status: requestData.status }
    } else {
      // For full updates, validate all fields
      const validatedData = activitySchema.parse(requestData)
      updateData = validatedData
    }

    // Check if activity exists and belongs to user
    const existingActivity = await prisma.activity.findUnique({
      where: { id: params.activityId },
    })

    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      )
    }

    if (existingActivity.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const activity = await prisma.activity.update({
      where: { id: params.activityId },
      data: updateData,
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Failed to update activity:', error)
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const activity = await prisma.activity.findUnique({
      where: { id: params.activityId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            location: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                state: true,
                country: true,
                postalCode: true
              }
            }
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this activity
    const hasAccess = 
      activity.userId === session.user.id || 
      activity.participants.some(p => 
        p.userId === session.user.id || 
        p.email === session.user.email
      )

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Format dates and location for client
    const formattedActivity = {
      ...activity,
      startTime: activity.startTime.toISOString(),
      endTime: activity.endTime.toISOString(),
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
      event: {
        ...activity.event,
        location: activity.event.location ? 
          `${activity.event.location.name}, ${activity.event.location.address}, ${activity.event.location.city}` : 
          null
      }
    }

    return NextResponse.json(formattedActivity)
  } catch (error) {
    console.error('Failed to fetch activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if activity exists and belongs to user
    const activity = await prisma.activity.findUnique({
      where: { id: params.activityId },
    })

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      )
    }

    if (activity.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.activity.delete({
      where: { id: params.activityId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete activity:', error)
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    )
  }
} 