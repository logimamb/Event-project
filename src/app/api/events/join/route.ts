import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { inviteCode } = await req.json()

    if (!inviteCode) {
      return new NextResponse('Invitation code is required', { status: 400 })
    }

    // Find the event with the given invite code
    const event = await prisma.event.findFirst({
      where: {
        shareableSlug: inviteCode,
      },
      include: {
        members: true,
      },
    })

    if (!event) {
      return new NextResponse('Invalid invitation code', { status: 404 })
    }

    // Check if user is already a member
    if (event.members.some(m => m.userId === session.user.id)) {
      return new NextResponse('You are already a member of this event', { status: 400 })
    }

    // Add user as a member
    await prisma.eventMember.create({
      data: {
        userId: session.user.id,
        eventId: event.id,
        role: 'MEMBER',
      },
    })

    // Revalidate event and dashboard pages
    revalidatePath('/events')
    revalidatePath('/dashboard')
    revalidatePath(`/events/${event.id}`)

    return NextResponse.json({
      eventId: event.id,
      message: 'Successfully joined event',
    })
  } catch (error) {
    console.error('Error joining event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 