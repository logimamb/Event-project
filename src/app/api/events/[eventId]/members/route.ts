import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import * as z from 'zod'
import { format } from 'date-fns'

const memberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().optional(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'GUEST']).default('GUEST'),
})

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const members = await prisma.eventMember.findMany({
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
            phoneNumber: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = memberSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Check if the user has permission to add members to this event
    const event = await prisma.event.findFirst({
      where: {
        id: params.eventId,
        OR: [
          { userId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
                role: { in: ['ADMIN', 'OWNER'] }
              }
            }
          }
        ]
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or insufficient permissions' },
        { status: 404 }
      )
    }

    // Find or create user based on email or phone number
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(validatedData.email ? [{ email: validatedData.email }] : []),
          ...(validatedData.phoneNumber ? [{ phoneNumber: validatedData.phoneNumber }] : [])
        ]
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phoneNumber: validatedData.phoneNumber,
        }
      })
    }

    // Check if user is already a member
    const existingMember = await prisma.eventMember.findFirst({
      where: {
        eventId: params.eventId,
        userId: user.id
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this event' },
        { status: 409 }
      )
    }

    // Add member to event
    const member = await prisma.eventMember.create({
      data: {
        eventId: params.eventId,
        userId: user.id,
        role: validatedData.role,
        permissions: [], // Default empty permissions array
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phoneNumber: true
          }
        }
      }
    })

    // Fetch complete event data with all required fields
    const eventDetails = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: {
        title: true,
        startDate: true,
        location: true
      }
    });

    if (!eventDetails) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    try {
      // Create a message for the new member
      const message = await prisma.message.create({
        data: {
          subject: `Event Invitation: ${eventDetails.title}`,
          content: `You've been invited to participate in: ${eventDetails.title}\n\nDetails:\n• Date: ${format(eventDetails.startDate, 'PPp')}\n• Location: ${eventDetails.location || 'Not specified'}\n\nPlease check your email for more details.`,
          type: 'EVENT',
          priority: 'MEDIUM',
          category: 'EVENT',
          fromUserId: session.user.id,
          toUserId: user.id,
          status: 'SENT',
          isArchived: false,
          isStarred: false,
          isScheduled: false,
        }
      });

      console.log('Created message:', message);
    } catch (error) {
      console.error('Error creating message:', error);
      // Don't fail the request if message creation fails
    }

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error adding member:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    )
  }
}