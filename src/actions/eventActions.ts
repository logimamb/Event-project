'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createGoogleCalendarEvent, updateGoogleCalendarEvent, deleteGoogleCalendarEvent, getGoogleCalendarClient } from '@/lib/googleCalendar'

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
        // category: true,
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
        // category: true,
        location: true,
        members: {
          include: {
            user: true
          },
        },
        _count: {
          select: {
            activities: true,
            members: true
          },
        },
      },
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

export async function createEvent(formData: FormData) {
//   console.log("Donnees recues:",data.description);
  // const validatedData = eventSchema.parse(data)

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    status: formData.get('status') as string,
    // startTime: formData.get('startTime') as string,
    // endTime: formData.get('endTime') as string,
    // eventId: formData.get('eventId') as string,
    country: formData.get('location.country') as string,
    city: formData.get('location.city') as string,
    address: formData.get('location.address') as string,
    // capacity: Number(formData.get('capacity')),

    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    priority: formData.get("priority"),
    isPublic: formData.get("isPublic"),
    // categoryId: formData.get("categoryId"),
    capacity: Number(formData.get("maxAttendees")),
    // locationId: locationId,
    // currentAttendees: formData.get("maxAttendees"),
    googleCalendarId: formData.get("googleCalendarId"),
    // userId: session.user.id
  }


  // First create the location if provided

//   console.log({Donnees:data});
  
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // First create the location if provided
    let locationId = undefined
    if (data.country) {
      const location = await prisma.location.create({
        data: {
          name: data.country || 'Unnamed Location',
          address: data.address,
          city: data.city,
          country: data.country
        }
      })
      locationId = location.id
    }

    // let locationId = undefined
    // if (data.location) {
    //   const location = await prisma.location.create({
    //     data: {
    //       name: data.location.address || 'Unnamed Location',
    //       address: data.location.address,
    //       city: data.location.city,
    //       country: data.location.country
    //     }
    //   })
    //   locationId = location.id
    // }

    // Then create the event with the location reference
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate as string,
        endDate: data.endDate as string,
        capacity: data.capacity,
        locationId: locationId,
        userId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
          },
        },
      },
      include: {
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

    // Create event in Google Calendar if user has integration
    try {
      // Only attempt to create Google Calendar event if a calendar ID was provided
      if (data.googleCalendarId) {
        const googleEvent = await createGoogleCalendarEvent(session.user.id, {
          title: data.title,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          location: event.location,
          calendarId: data.googleCalendarId,
        });

        if (googleEvent?.id) {
          await prisma.event.update({
            where: { id: event.id },
            data: { 
              googleCalendarEventId: googleEvent.id,
              googleCalendarId: googleEvent.calendarId
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      // Continue with the response even if Google Calendar creation fails
    }

    console.log("Event", event);
    

    return { success: true, data: event }
  } catch (error) {
    console.error('Failed to create event:', error)
    return { success: false, error: 'Failed to create event' }
  }
} 

export async function updateEvent(eventId: string, data: any) {
  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        googleCalendarEventId: true,
        googleCalendarId: true,
        userId: true
      }
    })

    if (!existingEvent) {
      throw new Error('Event not found')
    }

    // Update in database
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        locationId: data.locationId,
        capacity: data.capacity,
        googleCalendarId: data.googleCalendarId
      }
    })

    // If event has Google Calendar ID, update it there too
    if (existingEvent.googleCalendarEventId && existingEvent.googleCalendarId) {
      const googleCalendar = await getGoogleCalendarClient(existingEvent.userId)
      if (googleCalendar) {
        await googleCalendar.events.update({
          calendarId: existingEvent.googleCalendarId,
          eventId: existingEvent.googleCalendarEventId,
          requestBody: {
            summary: data.title,
            description: data.description,
            start: {
              dateTime: new Date(data.startDate).toISOString(),
              timeZone: 'UTC'
            },
            end: {
              dateTime: new Date(data.endDate).toISOString(),
              timeZone: 'UTC'
            }
          }
        })
      }
    }

    return updatedEvent
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
}

export async function deleteEvent(eventId: string, userId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        googleCalendarEventId: true,
        googleCalendarId: true,
        userId: true
      }
    })

    if (!event) {
      throw new Error('Event not found')
    }

    if (event.userId !== userId) {
      throw new Error('Unauthorized')
    }

    // If event has Google Calendar ID, delete it there first
    if (event.googleCalendarEventId && event.googleCalendarId) {
      const googleCalendar = await getGoogleCalendarClient(userId)
      if (googleCalendar) {
        try {
          await googleCalendar.events.delete({
            calendarId: event.googleCalendarId,
            eventId: event.googleCalendarEventId
          })
        } catch (error) {
          console.error('Error deleting from Google Calendar:', error)
          // Continue with local deletion even if Google Calendar deletion fails
        }
      }
    }

    // Delete from database
    await prisma.event.delete({
      where: { id: eventId }
    })

    return true
  } catch (error) {
    console.error('Error deleting event:', error)
    throw error
  }
}