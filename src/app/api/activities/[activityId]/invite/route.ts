import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { generateToken } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function POST(
  req: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { activityId } = params
    const { design } = await req.json()

    // Check if activity exists and user has permission
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        OR: [
          { userId: session.user.id },
          { event: { members: { some: { userId: session.user.id } } } }
        ]
      },
      include: {
        event: true,
        location: true,
      }
    })

    if (!activity) {
      return new NextResponse('Activity not found or unauthorized', { status: 404 })
    }

    // Generate a new invite code if one doesn't exist
    const inviteCode = generateToken(8)

    // Update activity with invite code and design
    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: { 
        shareableSlug: inviteCode,
        design: design || { template: 'modern' }
      },
    })

    // Revalidate activity page
    revalidatePath(`/activities/${activityId}`)

    return NextResponse.json({
      inviteCode: updatedActivity.shareableSlug,
      design: updatedActivity.design,
      activity: {
        ...activity,
        design: updatedActivity.design
      },
      message: 'Invite code and design updated successfully',
    })
  } catch (error) {
    console.error('Error in activity invite:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}