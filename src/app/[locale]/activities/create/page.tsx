import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CreateActivityForm } from '@/components/activity/create-activity-form'
import { getTranslations } from 'next-intl/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

interface CreateActivityPageProps {
  params: {
    locale: string
  }
  searchParams: {
    eventId?: string
  }
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations('activities')
  return {
    title: t('form.createTitle'),
    description: t('description'),
  }
}

export default async function CreateActivityPage({
  params,
  searchParams,
}: CreateActivityPageProps) {
  const session = await getServerSession(authOptions)
  const t = await getTranslations('activities')

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-6 lg:py-10">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl">{t('createActivity')}</h1>
            <p className="text-lg text-muted-foreground">
              {t('description')}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 lg:p-8">
            <CreateActivityForm 
              userId={session.user.id} 
              preselectedEventId={searchParams.eventId}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
