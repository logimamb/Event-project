'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TeamClient } from '@/components/team/team-client'
import { Suspense } from 'react'
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
          <Suspense fallback={
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          }>
            <TeamClient />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  )
}
