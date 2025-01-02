import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { generateToken } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { eventId } = params

    // Check if event exists and user has permission
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      },
    })

    if (!event) {
      return new NextResponse('Event not found or unauthorized', { status: 404 })
    }

    // Generate a new invite code if one doesn't exist
    const inviteCode = generateToken(8)

    // Update event with invite code
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { shareableSlug: inviteCode },
    })

    // Revalidate event page
    revalidatePath(`/events/${eventId}`)

    return NextResponse.json({
      inviteCode: updatedEvent.shareableSlug,
      message: 'Invite code generated successfully',
    })
  } catch (error) {
    console.error('Error generating invite code:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 