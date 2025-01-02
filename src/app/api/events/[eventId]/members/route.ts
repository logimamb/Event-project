import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { generateMemberCode } from '@/lib/utils/memberCode'
import { sendEventInvitation } from '@/lib/mail'

const memberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['OWNER', 'ADMIN', 'MODERATOR', 'MEMBER', 'GUEST']).default('GUEST'),
})

// Get all members of an event
export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // First check if the user has access to this event
    const userMember = await prisma.eventMember.findFirst({
      where: {
        eventId: params.eventId,
        userId: session.user.id,
      },
    })

    if (!userMember) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const eventMembers = await prisma.eventMember.findMany({
      where: {
        eventId: params.eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(eventMembers)
  } catch (error) {
    console.error('Failed to fetch event members:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// Add a new member to an event
export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    console.log('Received member addition request for event:', params.eventId)
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    console.log('Request body:', body)

    const validatedData = memberSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Check if the user is the event creator or has appropriate role
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      include: {
        members: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const isCreator = event.userId === session.user.id
    const userMember = event.members[0]
    const hasPermission = isCreator || userMember?.role === 'ADMIN' || userMember?.role === 'OWNER'

    console.log('Permission check:', { isCreator, userRole: userMember?.role })

    if (!hasPermission) {
      console.log('Permission denied')
      return NextResponse.json({ error: 'You do not have permission to add members' }, { status: 403 })
    }

    // Check if email is already used by a member (registered or guest)
    const existingMember = await prisma.eventMember.findFirst({
      where: {
        eventId: params.eventId,
        user: {
          email: validatedData.email
        }
      }
    })

    if (existingMember) {
      console.log('Email is already used by a member')
      return NextResponse.json(
        { error: 'This email is already associated with a member of the event' },
        { status: 409 }
      )
    }

    // Try to find registered user with this email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Only registered users can be added as members.' },
        { status: 404 }
      )
    }

    console.log('Creating new member')
    const newMember = await prisma.eventMember.create({
      data: {
        eventId: params.eventId,
        userId: user.id,
        role: validatedData.role,
        permissions: ['VIEW', 'COMMENT'], // Default permissions
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
    })

    // Try to send email invitation, but don't block if it fails
    try {
      const event = await prisma.event.findUnique({
        where: { id: params.eventId },
        select: { title: true }
      })
      
      if (event) {
        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${params.eventId}`
        await sendEventInvitation({ ...event, id: params.eventId }, newMember, inviteUrl)
      }
    } catch (error) {
      // Log the error but don't fail the request
      console.error('Error sending email:', error)
    }

    return NextResponse.json(newMember)
  } catch (error) {
    console.error('Failed to add event member:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update member role or permissions
export async function PATCH(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { memberId, role, permissions } = body

    // Check if user has permission to manage members
    const currentMember = await prisma.eventMember.findFirst({
      where: {
        eventId: params.eventId,
        userId: session.user.id,
        permissions: {
          some: {
            permission: 'MANAGE_MEMBERS',
          },
        },
      },
    })

    if (!currentMember) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Update member
    const updatedEventMember = await prisma.eventMember.update({
      where: {
        id: memberId,
      },
      data: {
        role,
        permissions: {
          deleteMany: {},
          create: permissions?.map(permission => ({
            permission,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        permissions: true,
      },
    })

    return NextResponse.json(updatedEventMember)
  } catch (error) {
    console.error('Failed to update event member:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// Remove a member from an event
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
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return new NextResponse('Member ID is required', { status: 400 })
    }

    // Check if user has permission to manage members
    const currentMember = await prisma.eventMember.findFirst({
      where: {
        eventId: params.eventId,
        userId: session.user.id,
        permissions: {
          some: {
            permission: 'MANAGE_MEMBERS',
          },
        },
      },
    })

    if (!currentMember) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Delete member
    await prisma.eventMember.delete({
      where: {
        id: memberId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to remove event member:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}