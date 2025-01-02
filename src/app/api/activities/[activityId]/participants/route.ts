import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Add participant to activity
export async function POST(
  req: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const activity = await prisma.activity.findUnique({
      where: { id: params.activityId },
      select: {
        capacity: true,
        currentParticipants: true,
        participants: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!activity) {
      return new NextResponse('Activity not found', { status: 404 })
    }

    // Check if user is already a participant
    if (activity.participants.length > 0) {
      return new NextResponse('Already participating', { status: 400 })
    }

    // Check if activity is at capacity
    if (activity.currentParticipants >= activity.capacity) {
      // Add to waitlist instead
      await prisma.activityParticipant.create({
        data: {
          activityId: params.activityId,
          userId: session.user.id,
          status: 'WAITLISTED'
        }
      })
      return NextResponse.json({ status: 'WAITLISTED' })
    }

    // Add participant and increment count
    const [participant] = await prisma.$transaction([
      prisma.activityParticipant.create({
        data: {
          activityId: params.activityId,
          userId: session.user.id,
          status: 'ACCEPTED'
        }
      }),
      prisma.activity.update({
        where: { id: params.activityId },
        data: { currentParticipants: { increment: 1 } }
      })
    ])

    return NextResponse.json(participant)
  } catch (error) {
    console.error('Error adding participant:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Remove participant from activity
export async function DELETE(
  req: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const participant = await prisma.activityParticipant.findUnique({
      where: {
        activityId_userId: {
          activityId: params.activityId,
          userId: session.user.id
        }
      }
    })

    if (!participant) {
      return new NextResponse('Not a participant', { status: 404 })
    }

    // Remove participant and decrement count if they were accepted
    if (participant.status === 'ACCEPTED') {
      await prisma.$transaction([
        prisma.activityParticipant.delete({
          where: {
            activityId_userId: {
              activityId: params.activityId,
              userId: session.user.id
            }
          }
        }),
        prisma.activity.update({
          where: { id: params.activityId },
          data: { currentParticipants: { decrement: 1 } }
        })
      ])
    } else {
      // Just remove the participant if they were waitlisted or pending
      await prisma.activityParticipant.delete({
        where: {
          activityId_userId: {
            activityId: params.activityId,
            userId: session.user.id
          }
        }
      })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error removing participant:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get activity participants
export async function GET(
  req: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const participants = await prisma.activityParticipant.findMany({
      where: { activityId: params.activityId },
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
    })

    return NextResponse.json(participants)
  } catch (error) {
    console.error('Error fetching participants:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
