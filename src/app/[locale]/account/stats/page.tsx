import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AccountStatsClient } from '@/components/account/stats-client'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations('account')
  return {
    title: t('stats.title'),
    description: t('stats.description')
  }
}

export default async function AccountStatsPage() {
  const t = await getTranslations('account')
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <ErrorBoundary fallback={t('stats.errorLoading')}>
          <Suspense 
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <AccountStatsClient />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  )
}
