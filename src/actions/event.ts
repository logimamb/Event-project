'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { eventSchema } from '@/lib/validations/event'

export async function getEvents() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      },
      include: {
        category: true,
        location: true,
        members: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            activities: true,
            members: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    return { success: true, data: events }
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return { success: false, error: 'Failed to fetch events' }
  }
}

export async function getEvent(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const event = await prisma.event.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      },
      include: {
        category: true,
        location: true,
        members: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            activities: true,
            members: true
          }
        }
      }
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    return { success: true, data: event }
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return { success: false, error: 'Failed to fetch event' }
  }
}

export async function createEvent(data: any) {
  console.log("Donnees recues:",data);
  // const validatedData = eventSchema.parse(data)
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // First create the location if provided
    let locationId = undefined
    if (data.location) {
      const location = await prisma.location.create({
        data: {
          name: data.location.address || 'Unnamed Location',
          address: data.location.address,
          city: data.location.city,
          country: data.location.country
        }
      })
      locationId = location.id
    }

    // Then create the event with the location reference
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        priority: data.priority,
        isPublic: data.isPublic,
        categoryId: data.categoryId,
        maxAttendees: data.maxAttendees,
        locationId: locationId,
        currentAttendees: data.maxAttendees,
        userId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        category: true,
        location: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    })
    

    console.log("Event", event);
    

    return { success: true, data: event }
  } catch (error) {
    console.error('Failed to create event:', error)
    return { success: false, error: 'Failed to create event' }
  }
} 