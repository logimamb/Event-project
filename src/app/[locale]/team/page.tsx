'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TeamClient } from '@/components/team/client'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold mb-4">Something went wrong:</h2>
      <pre className="text-red-500">{error.message}</pre>
    </div>
  )
}

export default function TeamPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense 
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <TeamClient />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  )
}
