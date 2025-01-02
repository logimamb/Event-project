import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
})

// Get all messages for an event
export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user is a member of the event
    const member = await prisma.eventMember.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: params.eventId,
        },
      },
    })

    if (!member) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: {
        eventId: params.eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// Send a new message
export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user has permission to send messages
    const member = await prisma.eventMember.findFirst({
      where: {
        eventId: params.eventId,
        userId: session.user.id,
        permissions: {
          some: {
            permission: 'SEND_MESSAGES',
          },
        },
      },
    })

    if (!member) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await req.json()
    const validatedData = messageSchema.parse(body)

    const message = await prisma.message.create({
      data: {
        content: validatedData.content,
        eventId: params.eventId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Get all event members for notifications
    const eventMembers = await prisma.eventMember.findMany({
      where: {
        eventId: params.eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    // Send notifications to all event members
    await Promise.all(
      eventMembers.map(async (member) => {
        if (member.user.email) {
          await sendEmail({
            to: member.user.email,
            subject: 'New Event Message',
            text: message,
          })
        }
      })
    )

    return NextResponse.json(message)
  } catch (error) {
    console.error('Failed to send message:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 })
    }
    return new NextResponse('Internal error', { status: 500 })
  }
}

// Delete a message
export async function DELETE(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return new NextResponse('Message ID is required', { status: 400 })
    }

    // Check if user is the message author or has admin permissions
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    })

    const member = await prisma.eventMember.findFirst({
      where: {
        eventId: params.eventId,
        userId: session.user.id,
      },
      include: {
        permissions: true,
      },
    })

    if (!message || (!member?.permissions.some(p => p.permission === 'MANAGE_MESSAGES') && message.userId !== session.user.id)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    await prisma.message.delete({
      where: {
        id: messageId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete message:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 