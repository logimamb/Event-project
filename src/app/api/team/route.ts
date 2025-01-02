import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Get all team members across all events and activities
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get all events where the user is a member or owner
    const userEvents = await prisma.event.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      select: {
        id: true,
        activities: {
          select: {
            id: true
          }
        }
      }
    })

    const eventIds = userEvents.map((event) => event.id)
    const activityIds = userEvents.flatMap((event) => 
      event.activities.map((activity) => activity.id)
    )

    // Get all members from these events
    const [eventMembers, activityParticipants] = await Promise.all([
      prisma.eventMember.findMany({
        where: {
          eventId: {
            in: eventIds
          }
        },
        select: {
          id: true,
          eventId: true,
          userId: true,
          role: true,
          permissions: true,
          joinedAt: true,
          updatedAt: true,
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
              status: true,
              isPublic: true,
              createdAt: true,
              userId: true,
              startDate: true,
              endDate: true,
              description: true,
              currentAttendees: true
            }
          }
        },
        orderBy: {
          event: {
            createdAt: 'desc'
          }
        }
      }),
      prisma.activityParticipant.findMany({
        where: {
          activityId: {
            in: activityIds
          }
        },
        select: {
          id: true,
          activityId: true,
          userId: true,
          email: true,
          name: true,
          status: true,
          joinedAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          activity: {
            select: {
              id: true,
              title: true,
              description: true,
              startTime: true,
              endTime: true,
              status: true,
              capacity: true,
              currentParticipants: true,
              eventId: true
            }
          }
        },
        orderBy: {
          joinedAt: 'desc'
        }
      })
    ])

    // Map the responses
    const membersWithPermissions = eventMembers.map(member => {
      const isEventOwner = member.event.userId === session.user.id
      const isUserSelf = member.userId === session.user.id

      return {
        id: member.id,
        type: 'event',
        user: member.user,
        name: member.user?.name || 'Unknown User',
        email: member.user?.email || 'No email provided',
        role: member.role,
        permissions: member.permissions,
        joinedAt: member.joinedAt.toISOString(),
        event: {
          id: member.event.id,
          title: member.event.title,
          status: member.event.status,
          isPublic: member.event.isPublic,
          startDate: member.event.startDate,
          endDate: member.event.endDate,
          description: member.event.description,
          currentAttendees: member.event.currentAttendees,
          createdAt: member.event.createdAt
        },
        permissions: {
          canEdit: isEventOwner || member.role === 'OWNER' || member.role === 'ADMIN',
          canDelete: isEventOwner || member.role === 'OWNER' || member.role === 'ADMIN',
          canInvite: isEventOwner || member.role === 'OWNER' || member.role === 'ADMIN' || member.role === 'MODERATOR',
          isSelf: isUserSelf
        }
      }
    })

    const participantsWithPermissions = activityParticipants.map(participant => {
      const isActivityOwner = participant.activity.eventId === session.user.id
      const isUserSelf = participant.userId === session.user.id

      return {
        id: participant.id,
        type: 'activity',
        user: participant.user,
        name: participant.name || participant.user?.name || 'Unknown User',
        email: participant.email || participant.user?.email || 'No email provided',
        status: participant.status,
        joinedAt: participant.joinedAt.toISOString(),
        activity: {
          id: participant.activity.id,
          title: participant.activity.title,
          description: participant.activity.description,
          startTime: participant.activity.startTime,
          endTime: participant.activity.endTime,
          status: participant.activity.status,
          capacity: participant.activity.capacity,
          currentParticipants: participant.activity.currentParticipants,
          eventId: participant.activity.eventId
        },
        permissions: {
          canEdit: isActivityOwner || isUserSelf,
          canDelete: isActivityOwner,
          canInvite: isActivityOwner,
          isSelf: isUserSelf
        }
      }
    })

    return NextResponse.json({
      eventMembers: membersWithPermissions,
      activityParticipants: participantsWithPermissions
    })
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
