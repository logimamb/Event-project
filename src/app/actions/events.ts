'use server'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { generateToken } from '@/lib/utils'
import { sendEmail } from '@/lib/email'
import { getEventEmailTemplate } from '@/lib/email-templates'
import { nanoid } from 'nanoid'
import { generateShareableUrl } from '@/lib/utils'

interface ShareEventData {
  type: 'email' | 'link'
  email?: string
  message?: string
  includeAccessibility?: boolean
}

export async function shareEvent(eventId: string, data: ShareEventData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Check if event exists and user has permission to share
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        activities: {
          include: {
            accessibility: true
          }
        },
        location: true,
        category: true
      },
    })

    if (!event) {
      throw new Error('Event not found')
    }

    // Generate a unique shareable slug if not exists
    let updatedEvent = event
    if (!event.shareableSlug) {
      updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          shareableSlug: nanoid(10)
        }
      })
    }

    // If sharing via email, create a share record and send email
    if (data.type === 'email' && data.email) {
      const token = generateToken()
      
      try {
        // Create share record first
        const eventShare = await prisma.eventShare.create({
          data: {
            eventId: eventId,
            email: data.email,
            token,
            message: data.message,
            status: 'pending',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            sharedById: session.user.id
          }
        })

        // Generate email content and send the email
        const emailContent = getEventEmailTemplate({
          event: updatedEvent,
          token,
          message: data.message,
          includeAccessibility: data.includeAccessibility
        })

        console.log('Attempting to send event invitation email to:', data.email)
        
        const emailResult = await sendEmail({
          to: data.email,
          subject: `Event Invitation: ${updatedEvent.title}`,
          html: emailContent
        })

        if (emailResult.success) {
          // Update share record status to sent
          await prisma.eventShare.update({
            where: { id: eventShare.id },
            data: { status: 'sent' }
          })

          console.log('Event invitation email sent successfully')
          
          return {
            success: true,
            shareableUrl: generateShareableUrl('event', eventId, updatedEvent.shareableSlug!),
            token
          }
        } else {
          // Update share record status to failed
          await prisma.eventShare.update({
            where: { id: eventShare.id },
            data: { status: 'failed' }
          })

          return {
            success: false,
            error: 'Failed to send invitation email'
          }
        }
      } catch (emailError) {
        console.error('Failed to send event invitation email:', emailError)
        return {
          success: false,
          error: emailError instanceof Error ? emailError.message : 'Failed to share event'
        }
      }
    }

    // For link sharing, just return the URL
    return {
      success: true,
      shareableUrl: generateShareableUrl('event', eventId, updatedEvent.shareableSlug!)
    }

  } catch (error) {
    console.error('Error sharing event:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share event'
    }
  }
}

export async function acceptInvitation(token: string) {
  try {
    const invitation = await prisma.eventInvitation.findUnique({
      where: { token },
      include: { event: true },
    })

    if (!invitation) {
      throw new Error('Invitation not found')
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired')
    }

    // Check if event is at capacity
    if (invitation.event.maxAttendees && invitation.event.currentAttendees >= invitation.event.maxAttendees) {
      // Add to waiting list
      await prisma.waitingList.create({
        data: {
          eventId: invitation.eventId,
          email: invitation.email,
          position: invitation.event.currentAttendees + 1,
          status: 'waiting',
        },
      })

      throw new Error('Event is at capacity. You have been added to the waiting list.')
    }

    // Update invitation status
    await prisma.eventInvitation.update({
      where: { token },
      data: {
        status: 'accepted',
        respondedAt: new Date(),
      },
    })

    // Create attendee record
    await prisma.attendee.create({
      data: {
        eventId: invitation.eventId,
        email: invitation.email,
        status: 'accepted',
        role: 'attendee',
      },
    })

    // Increment attendee count
    await prisma.event.update({
      where: { id: invitation.eventId },
      data: {
        currentAttendees: {
          increment: 1,
        },
      },
    })

    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    console.error('Error accepting invitation:', error)
    throw error
  }
}

export async function declineInvitation(token: string) {
  try {
    const invitation = await prisma.eventInvitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      throw new Error('Invitation not found')
    }

    await prisma.eventInvitation.update({
      where: { token },
      data: {
        status: 'declined',
        respondedAt: new Date(),
      },
    })

    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    console.error('Error declining invitation:', error)
    throw error
  }
} 