import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

// Add a GET endpoint for testing
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Fetching messages for user:', session.user.id)

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

    console.log('Found messages:', messages.length)
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
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

    const { receiverId, subject, content, type, priority, category } = await req.json()
    
    if (!receiverId) {
      return NextResponse.json(
        { error: 'Recipient is required' },
        { status: 400 }
      )
    }

    console.log('Creating message:', {
      fromUserId: session.user.id,
      toUserId: receiverId,
      subject,
      type,
      priority,
      category
    })

    // Create message in database
    const message = await prisma.message.create({
      data: {
        fromUserId: session.user.id,
        toUserId: receiverId,
        subject: subject || '',
        content: content || '',
        type: type || 'DIRECT',
        priority: priority || 'MEDIUM',
        category: category || 'GENERAL',
        status: 'SENT'
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
      }
    })

    console.log('Message created:', message)

    // Get recipient details for email notification
    const recipient = await prisma.user.findUnique({
      where: { id: receiverId },
      select: {
        email: true,
        name: true
      }
    })

    if (recipient?.email) {
      // Send email notification
      await sendEmail({
        to: recipient.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Message from ${session.user.name || 'Team Member'}</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 10px 0; color: #444;">${content}</p>
            </div>
            <p style="color: #666; font-size: 14px;">
              This is a notification for a message you received. Log in to your account to reply.
            </p>
          </div>
        `
      })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
