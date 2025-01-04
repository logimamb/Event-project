import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { locale: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { memberId, type } = await req.json()

    if (type === 'event') {
      await prisma.eventMember.delete({
        where: { id: memberId }
      })
    } else if (type === 'activity') {
      await prisma.activityParticipant.delete({
        where: { id: memberId }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing team member:', error)
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { locale: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { memberId, type, role } = await req.json()

    if (type === 'event') {
      await prisma.eventMember.update({
        where: { id: memberId },
        data: { role }
      })
    } else if (type === 'activity') {
      await prisma.activityParticipant.update({
        where: { id: memberId },
        data: { status: role }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating team member role:', error)
    return NextResponse.json(
      { error: 'Failed to update team member role' },
      { status: 500 }
    )
  }
}
