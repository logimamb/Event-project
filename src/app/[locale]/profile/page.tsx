import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProfileClient } from '@/components/profile/client'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'Profile | Event Manager',
  description: 'Manage your profile and preferences',
}

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <ErrorBoundary fallback="Error loading profile">
          <Suspense 
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <ProfileClient />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  )
} 
