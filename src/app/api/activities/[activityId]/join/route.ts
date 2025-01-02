import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { activityId } = params
    const { token } = await request.json()

    // Verify activity exists
    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
      include: {
        event: true,
      },
    })

    if (!activity) {
      return new NextResponse('Activity not found', { status: 404 })
    }

    // If token is provided, verify invitation
    if (token) {
      const invitation = await prisma.activityInvitation.findUnique({
        where: {
          token,
        },
      })

      if (!invitation) {
        return new NextResponse('Invalid invitation', { status: 403 })
      }

      if (invitation.expiresAt < new Date()) {
        return new NextResponse('Invitation expired', { status: 403 })
      }

      // Update invitation status
      await prisma.activityInvitation.update({
        where: {
          token,
        },
        data: {
          status: 'accepted',
        },
      })
    }

    // Add user as participant
    const participant = await prisma.activityParticipant.create({
      data: {
        activityId,
        userId: session.user.id,
        status: 'CONFIRMED',
      },
    })

    // If activity is part of an event, add user as event member if not already
    if (activity.event) {
      const existingMember = await prisma.eventMember.findFirst({
        where: {
          eventId: activity.event.id,
          userId: session.user.id,
        },
      })

      if (!existingMember) {
        await prisma.eventMember.create({
          data: {
            eventId: activity.event.id,
            userId: session.user.id,
            role: 'MEMBER',
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      participant,
    })
  } catch (error) {
    console.error('Error joining activity:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 