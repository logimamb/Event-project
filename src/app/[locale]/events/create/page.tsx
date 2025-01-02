import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CreateEventPageContent } from '@/components/event/create-event-page'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations('events')
  return {
    title: t('form.createTitle')
  }
}

export default async function CreateEventPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  return <CreateEventPageContent />
}
