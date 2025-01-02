import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { EventList } from '@/components/EventList'
import { getUserEvents } from '@/services/event-service'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations('events')
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function EventsPage() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations('events')

  if (!session?.user) {
    redirect('/auth/signin')
  }

  try {
    const events = await getUserEvents(session.user.id)

    return (
      <DashboardLayout>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('description')}
            </p>
          </div>
          <Link href="/events/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('createEvent')}
            </Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-lg font-semibold">{t('noEvents')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('createFirstEvent')}
            </p>
            <div className="mt-6">
              <Link href="/events/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createEvent')}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <EventList events={events} />
        )}
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error fetching events:', error)
    return (
      <DashboardLayout>
        <div className="container mx-auto py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">{t('errorTitle')}</h1>
            <p>{t('error')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }
}
