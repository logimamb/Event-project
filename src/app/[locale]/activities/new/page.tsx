import { Metadata } from 'next'
import { NewActivityPageContent } from './new-activity-content'

export const metadata: Metadata = {
  title: 'New Activity | Event Manager',
  description: 'Create a new activity for your event',
}

export default function NewActivityPage() {
  return <NewActivityPageContent />
}

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { NewActivityForm } from '@/components/activities/new-activity-form'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

function NewActivityPageContent() {
  const t = useTranslations('activities')
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="container px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Create New Activity</h1>
              <p className="text-base text-muted-foreground max-w-2xl">
                Add a new activity to your event schedule. Activities help you organize and manage different parts of your event.
              </p>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => router.back()}
              className="shrink-0"
            >
              Cancel
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-card shadow-sm">
                <div className="p-6">
                  <ErrorBoundary fallback="Error loading activity form">
                    <Suspense 
                      fallback={
                        <div className="flex items-center justify-center min-h-[400px]">
                          <LoadingSpinner size="lg" />
                        </div>
                      }
                    >
                      <NewActivityForm />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border bg-card shadow-sm p-6 space-y-6 sticky top-8">
                <div>
                  <h3 className="font-semibold mb-2">Tips for Creating Activities</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Choose a clear and descriptive title that reflects the activity's purpose</li>
                    <li>• Set realistic capacity limits based on venue size and activity type</li>
                    <li>• Provide detailed location information to help participants find the activity</li>
                    <li>• Ensure the activity duration fits within the event's schedule</li>
                  </ul>
                </div>
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-2">Activity Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    Your activity details will be displayed to participants in an organized and easy-to-read format.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
