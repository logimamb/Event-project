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
              image: true,
              city: true,
              country: true,
              phoneNumber: true,
              timezone: true
            }
          },
          event: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true
            }
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
          name: true,
          email: true,
          status: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              city: true,
              country: true,
              phoneNumber: true,
              timezone: true
            }
          },
          activity: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true
            }
          }
        }
      })
    ])

    return NextResponse.json({
      eventMembers,
      activityParticipants
    })
  } catch (error) {
    console.error('Error in team route:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
