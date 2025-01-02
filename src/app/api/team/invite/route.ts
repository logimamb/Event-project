import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendEventInvitation } from '@/lib/mail'
import { nanoid } from 'nanoid'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { email, eventId } = await request.json()

    if (!email || !eventId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check if user is already a member
    const existingMember = await prisma.eventMember.findFirst({
      where: {
        email,
        eventId
      }
    })

    if (existingMember) {
      return new NextResponse('User is already a member of this event', { status: 400 })
    }

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        user: true
      }
    })

    if (!event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    // Generate unique member code
    const memberCode = nanoid(10)

    // Create member
    const member = await prisma.eventMember.create({
      data: {
        email,
        role: 'MEMBER',
        memberCode,
        event: { connect: { id: eventId } }
      }
    })

    // Try to send invitation email, but don't fail if it doesn't work
    try {
      await sendEventInvitation({
        to: email,
        event: {
          title: event.title,
          description: event.description || '',
          startTime: event.startDate,
          endTime: event.endDate,
          location: event.location?.name || '',
        },
        invitedBy: {
          name: session.user?.name || 'Someone',
          email: session.user?.email || '',
        },
        memberCode,
        acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}/join?code=${memberCode}`,
      })
    } catch (emailError) {
      console.warn('Failed to send invitation email:', emailError)
      // Continue with the response even if email fails
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Failed to invite member:', error)
    return new NextResponse('Failed to invite member', { status: 500 })
  }
}
