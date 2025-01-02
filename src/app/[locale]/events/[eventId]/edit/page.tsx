import { EventForm } from '@/components/EventForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface EditEventPageProps {
  params: {
    eventId: string
    locale: string
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Fetch event with all necessary relations
  const event = await prisma.event.findFirst({
    where: {
      id: params.eventId,
      OR: [
        { userId: session.user.id },
        {
          members: {
            some: {
              userId: session.user.id,
              role: { in: ['OWNER', 'ADMIN'] }
            }
          }
        }
      ]
    },
    include: {
      location: true,
      highlights: true,
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
      activities: true,
      _count: {
        select: {
          members: true,
          activities: true
        }
      }
    }
  })

  if (!event) {
    notFound()
  }

  // Check if user has permission to edit
  const isCreator = event.userId === session.user.id
  const isAdmin = event.members.some(
    member => member.userId === session.user.id && ['OWNER', 'ADMIN'].includes(member.role)
  )

  if (!isCreator && !isAdmin) {
    redirect(`/${params.locale}/events/${params.eventId}`)
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link 
                href={`/${params.locale}/events/${params.eventId}`}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Event
              </Link>
            </Button>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
            <EventForm 
              event={event} 
              locale={params.locale}
              isEdit={true}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}