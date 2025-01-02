import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import * as z from 'zod'

const registrationSchema = z.object({
  formData: z.record(z.string(), z.any()),
})

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const eventId = params.eventId
    const body = await req.json()
    const validatedData = registrationSchema.parse(body)

    // Check if event exists and is open for registration
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrationForm: true,
        _count: {
          select: { registrations: true },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Event is not open for registration' },
        { status: 400 }
      )
    }

    if (event.maxAttendees && event._count.registrations >= event.maxAttendees) {
      return NextResponse.json(
        { error: 'Event is full' },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this event' },
        { status: 400 }
      )
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId: session.user.id,
        formData: validatedData.formData,
        status: event.price ? 'PENDING' : 'CONFIRMED',
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            price: true,
            currency: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // If event has a price, create a pending payment
    if (event.price) {
      await prisma.payment.create({
        data: {
          eventId,
          registrationId: registration.id,
          amount: event.price,
          currency: event.currency || 'USD',
          status: 'PENDING',
          provider: 'STRIPE', // Default to Stripe
        },
      })
    }

    // Update event attendee count
    await prisma.event.update({
      where: { id: eventId },
      data: {
        currentAttendees: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Failed to register for event:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid registration data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const eventId = params.eventId

    // Check if user has permission to view registrations
    const member = await prisma.eventMember.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    })

    if (!member || !member.permissions.includes('MANAGE_MEMBERS')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        payment: {
          select: {
            status: true,
            amount: true,
            currency: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Failed to fetch registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const eventId = params.eventId
    const body = await req.json()
    const { registrationId, status } = body

    if (!registrationId || !status) {
      return NextResponse.json(
        { error: 'Registration ID and status are required' },
        { status: 400 }
      )
    }

    // Check if user has permission to manage registrations
    const member = await prisma.eventMember.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    })

    if (!member || !member.permissions.includes('MANAGE_MEMBERS')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const registration = await prisma.registration.update({
      where: { id: registrationId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Failed to update registration:', error)
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    )
  }
} 