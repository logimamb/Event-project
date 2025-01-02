import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { role } = await request.json()
    const { memberId } = params

    // Validate role
    const validRoles = ['OWNER', 'ADMIN', 'MODERATOR', 'MEMBER']
    if (!validRoles.includes(role)) {
      return new NextResponse('Invalid role', { status: 400 })
    }

    // Get the member and check permissions
    const member = await prisma.eventMember.findUnique({
      where: { id: memberId },
      include: {
        event: {
          include: {
            members: {
              where: {
                userId: session.user.id
              }
            }
          }
        }
      }
    })

    if (!member) {
      return new NextResponse('Member not found', { status: 404 })
    }

    // Check if current user has permission to change roles
    const currentUserMember = member.event.members[0]
    if (!currentUserMember || !['OWNER', 'ADMIN'].includes(currentUserMember.role)) {
      return new NextResponse('Permission denied', { status: 403 })
    }

    // Don't allow changing OWNER's role unless you're the OWNER
    if (member.role === 'OWNER' && currentUserMember.role !== 'OWNER') {
      return new NextResponse('Cannot change owner\'s role', { status: 403 })
    }

    // Update member role
    const updatedMember = await prisma.eventMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          }
        }
      }
    })

    // Add permissions to the response
    const memberWithPermissions = {
      ...updatedMember,
      permissions: {
        canEdit: ['OWNER', 'ADMIN'].includes(currentUserMember.role),
        canDelete: ['OWNER', 'ADMIN'].includes(currentUserMember.role),
        canInvite: ['OWNER', 'ADMIN', 'MODERATOR'].includes(currentUserMember.role)
      }
    }

    return NextResponse.json(memberWithPermissions)
  } catch (error) {
    console.error('Failed to update member role:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
