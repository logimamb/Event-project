import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user is a team member
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id
      }
    })

    if (!teamMember) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    // Get team with all related data
    const team = await prisma.team.findUnique({
      where: { id: params.teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        activities: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        },
        events: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!team) {
      return new NextResponse('Team not found', { status: 404 })
    }

    // Combine and deduplicate participants
    const allParticipants = new Map()

    // Add team members first
    team.members.forEach(member => {
      if (member.user) {
        allParticipants.set(member.user.id, {
          ...member.user,
          teamRole: member.role,
          activities: [],
          events: []
        })
      }
    })

    // Add activity participants
    team.activities.forEach(activity => {
      activity.participants.forEach(participant => {
        if (participant.user) {
          const existingParticipant = allParticipants.get(participant.user.id)
          allParticipants.set(participant.user.id, {
            ...participant.user,
            teamRole: existingParticipant?.teamRole,
            activities: [...(existingParticipant?.activities || []), {
              id: activity.id,
              title: activity.title,
              status: participant.status
            }],
            events: existingParticipant?.events || []
          })
        }
      })
    })

    // Add event members
    team.events.forEach(event => {
      event.members.forEach(member => {
        if (member.user) {
          const existingParticipant = allParticipants.get(member.user.id)
          allParticipants.set(member.user.id, {
            ...member.user,
            teamRole: existingParticipant?.teamRole,
            activities: existingParticipant?.activities || [],
            events: [...(existingParticipant?.events || []), {
              id: event.id,
              title: event.title,
              role: member.role
            }]
          })
        }
      })
    })

    // Convert to array and sort by name
    const participants = Array.from(allParticipants.values())
    participants.sort((a, b) => {
      if (!a.name) return 1
      if (!b.name) return -1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json(participants)
  } catch (error) {
    console.error('Error fetching team participants:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
