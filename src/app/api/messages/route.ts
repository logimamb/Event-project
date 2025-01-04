import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

// Add a GET endpoint for testing
export async function GET() {
  return NextResponse.json({ message: 'Messages API is working' })
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { recipientId, subject, message } = await req.json()

    // Get recipient details
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        email: true,
        name: true
      }
    })

    if (!recipient?.email) {
      return NextResponse.json(
        { error: 'Recipient not found or has no email' },
        { status: 404 }
      )
    }

    // Send email using nodemailer
    const emailResult = await sendEmail({
      to: recipient.email,
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
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    // Store the message in the database
    const storedMessage = await prisma.message.create({
      data: {
        fromUserId: session.user.id,
        toUserId: recipientId,
        subject,
        content: message,
        status: 'SENT'
      }
    })

    return NextResponse.json({
      success: true,
      messageId: storedMessage.id
    })
  } catch (error) {
    console.error('Error in messages route:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
