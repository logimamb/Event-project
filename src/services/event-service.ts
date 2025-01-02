import { prisma } from '@/lib/prisma'

// Utility functions
// export function isValidEventId(eventId: string): boolean {
//   return /^[0-9a-fA-F]{24}$/.test(eventId)
// }

// export function isValidEventId(eventId: string): boolean {
//   return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(eventId);
// }

// export function isValidEventId(eventId: string): boolean {
//   return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(eventId);
// }

export function isValidEventId(eventId: string): boolean {
  // Expression régulière pour les UUID version 4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  // Expression régulière pour les CUID (format cuid2)
  const cuidRegex = /^c[a-z0-9]{20,}$/i;

  return uuidRegex.test(eventId) || cuidRegex.test(eventId);
}


async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (attempt === maxRetries) break
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
    }
  }
  throw lastError
}

export async function getEventById(eventId: string, userId: string) {
  if (!isValidEventId(eventId)) {
    throw new Error('Invalid event ID format')
  }

  return executeWithRetry(async () => {
    console.log(`Fetching event with ID: ${eventId} for user: ${userId}`)
    
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          { userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        location: true,
        members: {
          select: {
            id: true,
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
            }
          }
        },
        activities: true,
        team: true,
        highlights: true,
        _count: {
          select: {
            activities: true,
            members: true
          }
        }
      }
    })

    if (!event) {
      throw new Error('Event not found')
    }

    return event
  })
}

export async function getUserEvents(userId: string | undefined) {
  return executeWithRetry(async () => {
    if (!userId) {
      return []
    }

    console.log(`Fetching events for user: ${userId}`)
    
    return await prisma.event.findMany({
      where: {
        OR: [
          { userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        location: true,
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
        creatorId: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        activities: true,
        team: true,
        _count: {
          select: {
            activities: true,
            members: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })
  })
} 