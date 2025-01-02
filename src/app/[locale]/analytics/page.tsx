import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AnalyticsClient } from '@/components/analytics/client'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'Analytics | Event Manager',
  description: 'Comprehensive analytics and insights for your events and activities',
}

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <ErrorBoundary fallback="Error loading analytics">
          <Suspense 
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <AnalyticsClient />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  )
} 
