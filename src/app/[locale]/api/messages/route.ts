import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, ensureDatabaseConnection } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function GET(
  request: Request,
  { params }: { params: { locale: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id }
        ]
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { locale: string } }
) {
  try {
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

    // Find or create recipient user
    let recipientUser = await prisma.user.findUnique({
      where: { email: recipientEmail }
    })

    if (!recipientUser) {
      // Create a temporary user if they don't exist
      recipientUser = await prisma.user.create({
        data: {
          email: recipientEmail,
          name: recipientEmail.split('@')[0], // Use part before @ as name
        }
      })
    }

    // Store the message in the database
    console.log('Storing message in database')
    const storedMessage = await prisma.message.create({
      data: {
        subject,
        content: message,
        status: 'SENT',
        fromUser: {
          connect: {
            id: session.user.id
          }
        },
        toUser: {
          connect: {
            id: recipientUser.id
          }
        }
      }
    })
    
    console.log('Message stored successfully:', storedMessage.id)

    // Send email using nodemailer
    console.log('Sending email to:', recipientEmail)
    const emailResult = await sendEmail({
      to: recipientEmail,
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
      return NextResponse.json({
        success: true,
        warning: 'Message saved but email delivery failed: ' + emailResult.error,
        data: storedMessage
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: storedMessage
    })
  } catch (error) {
    console.error('Error in messages route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process message' },
      { status: 500 }
    )
  }
}
