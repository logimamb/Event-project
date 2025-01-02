import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/mail'

// Update member role
export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { role } = await req.json()

    // Get the member and check permissions
    const member = await prisma.eventMember.findUnique({
      where: { id: params.memberId },
      include: {
        event: {
          select: {
            userId: true,
            members: {
              where: {
                userId: session.user.id,
                role: { in: ['OWNER', 'ADMIN'] }
              }
            }
          }
        }
      }
    })

    if (!member) {
      return new NextResponse('Member not found', { status: 404 })
    }

    // Check if user has permission to update roles
    const hasPermission = member.event.userId === session.user.id || member.event.members.length > 0
    if (!hasPermission) {
      return new NextResponse('Permission denied', { status: 403 })
    }

    // Update member role
    const updatedMember = await prisma.eventMember.update({
      where: { id: params.memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            type: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Failed to update member:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// Delete member
export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the member and check permissions
    const member = await prisma.eventMember.findUnique({
      where: { id: params.memberId },
      include: {
        event: {
          select: {
            userId: true,
            title: true,
            members: {
              where: {
                userId: session.user.id,
                role: { in: ['OWNER', 'ADMIN'] }
              }
            }
          }
        },
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!member) {
      return new NextResponse('Member not found', { status: 404 })
    }

    // Check if user has permission to remove members
    const hasPermission = member.event.userId === session.user.id || member.event.members.length > 0
    if (!hasPermission) {
      return new NextResponse('Permission denied', { status: 403 })
    }

    // Delete member
    await prisma.eventMember.delete({
      where: { id: params.memberId }
    })

    // Try to send notification email, but don't fail if it doesn't work
    try {
      const memberEmail = member.user?.email || member.email
      const memberName = member.user?.name || member.name
      if (memberEmail && process.env.EMAIL_FROM && process.env.EMAIL_PASSWORD) {
        await sendEmail({
          to: memberEmail,
          subject: `Removed from ${member.event.title}`,
          text: `Hi ${memberName},\n\nYou have been removed from the event "${member.event.title}".\n\nBest regards,\nThe Event Team`,
          html: `
            <p>Hi ${memberName},</p>
            <p>You have been removed from the event "${member.event.title}".</p>
            <p>Best regards,<br>The Event Team</p>
          `
        })
      }
    } catch (error) {
      // Log the error but don't fail the deletion
      console.error('Failed to send removal notification email:', error)
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete member:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// Send message to member
export async function POST(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { message, subject } = await req.json()

    // Get the member
    const member = await prisma.eventMember.findUnique({
      where: { id: params.memberId },
      include: {
        event: {
          select: {
            userId: true,
            title: true,
            members: {
              where: {
                userId: session.user.id
              }
            }
          }
        },
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!member) {
      return new NextResponse('Member not found', { status: 404 })
    }

    // Check if user is part of the event
    const isMember = member.event.userId === session.user.id || member.event.members.length > 0
    if (!isMember) {
      return new NextResponse('Permission denied', { status: 403 })
    }

    const memberEmail = member.user?.email || member.email
    const memberName = member.user?.name || member.name

    if (!memberEmail) {
      return new NextResponse('Member has no email address', { status: 400 })
    }

    // Send message email
    await sendEmail({
      to: memberEmail,
      subject: `${subject} - Regarding ${member.event.title}`,
      text: `Hi ${memberName},\n\n${message}\n\nBest regards,\n${session.user.name}`,
      html: `
        <p>Hi ${memberName},</p>
        <p>${message}</p>
        <p>Best regards,<br>${session.user.name}</p>
      `
    })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('Failed to send message:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
