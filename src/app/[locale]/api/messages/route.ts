import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, ensureDatabaseConnection } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

// Add a GET endpoint for testing
export async function GET(
  request: Request,
  { params }: { params: { locale: string } }
) {
  return NextResponse.json({ message: 'Messages API is working', locale: params.locale })
}

export async function POST(
  request: Request,
  { params }: { params: { locale: string } }
) {
  try {
    // Ensure database connection is healthy
    const isConnected = await ensureDatabaseConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { recipientId, recipientEmail, subject, message } = await request.json()
    console.log('Received message request:', { recipientId, recipientEmail, subject })

    if (!recipientId && !recipientEmail) {
      return NextResponse.json(
        { error: 'Either recipient ID or email is required' },
        { status: 400 }
      )
    }

    let recipientDetails = null

    if (recipientId) {
      // Try to find the recipient by user ID first
      recipientDetails = await prisma.user.findUnique({
        where: { id: recipientId },
        select: {
          id: true,
          email: true,
          name: true
        }
      })
    }

    if (!recipientDetails && recipientEmail) {
      // If no user found or no recipientId provided, use the direct email
      recipientDetails = {
        id: null,
        email: recipientEmail,
        name: null
      }
    }

    console.log('Recipient details:', recipientDetails)

    if (!recipientDetails?.email) {
      return NextResponse.json(
        { error: 'No valid recipient email found' },
        { status: 400 }
      )
    }

    // Send email using nodemailer
    console.log('Sending email to:', recipientDetails.email)
    const emailResult = await sendEmail({
      to: recipientDetails.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Message from ${session.user.name || 'Team Member'}</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #555; line-height: 1.6;">${message}</p>
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            This message was sent via the Event Calendar platform.
          </p>
        </div>
      `
    })

    if (!emailResult.success) {
      console.error('Error sending email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send email: ' + emailResult.error },
        { status: 500 }
      )
    }

    // Store the message in the database only if we have a recipient user ID
    if (recipientDetails.id) {
      console.log('Storing message in database')
      const storedMessage = await prisma.message.create({
        data: {
          fromUserId: session.user.id,
          toUserId: recipientDetails.id,
          subject,
          content: message,
          status: 'SENT'
        }
      })
      console.log('Message stored successfully:', storedMessage.id)
    } else {
      console.log('Skipping database storage as recipient has no user account')
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    })
  } catch (error) {
    console.error('Error in messages route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process message' },
      { status: 500 }
    )
  }
}
