import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'
import * as z from 'zod'

const memberSchema = z.object({
  eventId: z.string(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(10).optional(),
  name: z.string().min(1),
  role: z.enum(['MEMBER', 'MODERATOR', 'ADMIN']),
}).refine((data) => data.email || data.phoneNumber, {
  message: "Either email or phone number must be provided",
  path: ["email"]
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = memberSchema.parse(body)

    // Check if the user has permission to add members to this event
    const event = await prisma.event.findFirst({
      where: {
        id: validatedData.eventId,
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
        eventId: validatedData.eventId,
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
        eventId: validatedData.eventId,
        userId: user.id,
        role: validatedData.role,
        memberCode: `mem_${nanoid(10)}`,
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
