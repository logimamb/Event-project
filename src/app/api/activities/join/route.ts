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

    // Find the activity with the given invite code
    const activity = await prisma.activity.findFirst({
      where: {
        shareableSlug: inviteCode,
      },
      include: {
        participants: true,
      },
    })

    if (!activity) {
      return new NextResponse('Invalid invitation code', { status: 404 })
    }

    // Check if user is already a participant
    if (activity.participants.some(p => p.userId === session.user.id)) {
      return new NextResponse('You are already a participant in this activity', { status: 400 })
    }

    // Add user as a participant
    await prisma.activityParticipant.create({
      data: {
        userId: session.user.id,
        activityId: activity.id,
        status: 'CONFIRMED',
      },
    })

    // Revalidate activity and dashboard pages
    revalidatePath('/activities')
    revalidatePath('/dashboard')
    revalidatePath(`/activities/${activity.id}`)

    return NextResponse.json({
      activityId: activity.id,
      message: 'Successfully joined activity',
    })
  } catch (error) {
    console.error('Error joining activity:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 