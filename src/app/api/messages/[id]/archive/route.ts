import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const message = await prisma.message.findUnique({
      where: { id: params.id }
    })

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to archive this message
    if (message.fromUserId !== session.user.id && message.toUserId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Toggle the isArchived status
    const updatedMessage = await prisma.message.update({
      where: { id: params.id },
      data: { isArchived: !message.isArchived },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error archiving message:', error)
    return NextResponse.json(
      { error: 'Failed to archive message' },
      { status: 500 }
    )
  }
}
