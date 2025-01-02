'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { activitySchema } from '@/lib/validations/activity'
import { ZodError } from 'zod'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function createActivity(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      eventId: formData.get('eventId') as string,
      location: formData.get('location') as string,
      capacity: Number(formData.get('capacity')),
      userId: session.user.id
    }

    const validatedData = activitySchema.parse(data)

    const activity = await prisma.activity.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        location: validatedData.location,
        capacity: validatedData.capacity,
        event: {
          connect: {
            id: validatedData.eventId
          }
        },
        user: {
          connect: {
            id: session.user.id
          }
        }
      }
    })

    revalidatePath('/activities')
    revalidatePath(`/events/${validatedData.eventId}`)
    return { success: true, data: activity }
  } catch (error) {
    console.error('Failed to create activity:', error)
    
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }
    }

    return {
      success: false,
      error: 'Failed to create activity',
    }
  }
}

export async function updateActivity(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    const id = formData.get('id') as string
    const eventId = formData.get('eventId') as string

    if (!id) {
      return {
        success: false,
        error: 'Activity ID is required',
      }
    }

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      eventId: eventId,
      location: formData.get('location') as string,
      capacity: Number(formData.get('capacity')),
      userId: session.user.id
    }

    const validatedData = activitySchema.parse(data)

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        location: validatedData.location,
        capacity: validatedData.capacity,
        event: {
          connect: {
            id: validatedData.eventId
          }
        },
        user: {
          connect: {
            id: session.user.id
          }
        }
      }
    })

    revalidatePath('/activities')
    revalidatePath(`/events/${eventId}`)
    return { success: true, data: activity }
  } catch (error) {
    console.error('Failed to update activity:', error)
    
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }
    }

    return {
      success: false,
      error: 'Failed to update activity',
    }
  }
}

export async function updateActivityStatus(id: string, status: string) {
  try {
    const activity = await prisma.activity.update({
      where: { id },
      data: { status },
      include: {
        event: true
      }
    })

    // Revalidate all necessary paths
    revalidatePath('/dashboard')
    revalidatePath('/activities')
    revalidatePath(`/activities/${id}`)
    revalidatePath(`/events/${activity.eventId}`)
    revalidatePath('/events')
    
    return { success: true, data: activity }
  } catch (error) {
    console.error('Failed to update activity status:', error)
    return { success: false, error: 'Failed to update activity status' }
  }
}

export async function deleteActivity(id: string) {
  try {
    await prisma.activity.delete({
      where: { id },
    })
    revalidatePath('/activities')
  } catch (error) {
    console.error('Failed to delete activity:', error)
    throw new Error('Failed to delete activity')
  }
}

export async function getActivities(eventId?: string) {
  try {
    const activities = await prisma.activity.findMany({
      where: eventId ? { eventId } : undefined,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            location: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        participants: true
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    return { success: true, data: activities }
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return { success: false, error: 'Failed to fetch activities' }
  }
} 