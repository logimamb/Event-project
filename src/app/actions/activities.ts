'use server'

import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/lib/email'
import { getActivityEmailTemplate } from '@/lib/email-templates'
import { generateShareableUrl, generateToken } from '@/lib/utils'

interface ShareActivityData {
  type: 'email' | 'link' | 'qr'
  email?: string
  message?: string
  includeAccessibility?: boolean
  expiryDays?: number
}

export async function shareActivity(activityId: string, data: ShareActivityData) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        event: {
          select: {
            title: true,
            description: true,
          }
        },
        user: true,
        participants: true
      },
    })

    if (!activity) {
      throw new Error('Activity not found')
    }

    // Generate a unique shareable slug if not exists
    const shareableSlug = activity.shareableSlug || nanoid(10)

    // Update activity with shareable slug if not exists
    if (!activity.shareableSlug) {
      await prisma.activity.update({
        where: { id: activityId },
        data: { shareableSlug },
      })
    }

    const shareableUrl = generateShareableUrl('activity', activityId, shareableSlug)

    // If sharing via email, create invitation and send email
    if (data.type === 'email' && data.email) {
      let token: string | undefined
      let invitationCreated = false

      try {
        // Generate token and create invitation
        token = generateToken()
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + (data.expiryDays || 7))

        console.log('Creating invitation for:', {
          activityId,
          email: data.email,
          expiryDate
        })

        // Create invitation record
        await prisma.activityInvitation.create({
          data: {
            activityId,
            email: data.email,
            token,
            expiresAt: expiryDate,
            status: 'pending'
          }
        })
        invitationCreated = true
        console.log('Invitation created successfully')

        // Generate email content using the template
        const emailContent = getActivityEmailTemplate({
          activity: {
            ...activity,
            id: activityId,
            startTime: activity.startTime?.toISOString(),
            endTime: activity.endTime?.toISOString()
          },
          token,
          message: data.message,
          includeAccessibility: data.includeAccessibility
        })

        console.log('Sending email to:', data.email)

        // Send the email
        const emailResult = await sendEmail({
          to: data.email,
          subject: `Activity Invitation: ${activity.title}`,
          html: emailContent
        })

        console.log('Email sent successfully:', emailResult)

        return {
          success: true,
          shareableUrl,
          token
        }
      } catch (emailError) {
        console.error('Error in email sharing process:', emailError)
        
        // Delete the invitation if it was created but email failed
        if (invitationCreated && token) {
          try {
            console.log('Cleaning up invitation due to email failure')
            await prisma.activityInvitation.delete({
              where: { token }
            })
            console.log('Invitation cleaned up successfully')
          } catch (deleteError) {
            console.error('Error deleting invitation:', deleteError)
          }
        }

        // Throw appropriate error message
        if (emailError instanceof Error) {
          if (emailError.message.includes('authentication failed')) {
            throw new Error('Email service configuration error: Please contact support')
          }
          if (emailError.message.includes('configuration missing')) {
            throw new Error('Email service not configured properly')
          }
          throw emailError
        }
        throw new Error('Failed to send invitation email')
      }
    }

    // For link sharing, just return the URL
    return {
      success: true,
      shareableUrl
    }

  } catch (error) {
    console.error('Error sharing activity:', error)
    throw error instanceof Error ? error : new Error('Failed to share activity')
  }
} 