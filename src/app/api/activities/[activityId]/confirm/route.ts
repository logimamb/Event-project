import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(
  req: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { status } = await req.json()
    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 })
    }

    // Find the participant entry
    const participant = await prisma.activityParticipant.findFirst({
      where: {
        activityId: params.activityId,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return new NextResponse('Participant not found', { status: 404 })
    }

    // Update the participant status
    const updatedParticipant = await prisma.activityParticipant.update({
      where: { id: participant.id },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(updatedParticipant)
  } catch (error) {
    console.error('Error confirming participation:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
