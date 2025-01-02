import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SharedEventPageProps {
  params: {
    eventId: string
  }
}

export default async function SharedEventPage({ params: { eventId } }: SharedEventPageProps) {
  if (!eventId) {
    notFound()
  }

  try {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!event) {
      notFound()
    }

    const formattedDate = event.startDate
      ? new Date(event.startDate).toLocaleDateString()
      : 'Date to be announced'

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          
          <div className="space-y-4">
            {event.description && (
              <p className="text-muted-foreground">{event.description}</p>
            )}
            
            <div className="text-sm space-y-2">
              <p><strong>Date:</strong> {formattedDate}</p>
              <p><strong>Organized by:</strong> {event.user.name}</p>
            </div>

            <div className="flex gap-4 mt-6">
              <Link href={`/events/${event.id}`}>
                <Button>View Event Details</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching event:', error)
    notFound()
  }
} 