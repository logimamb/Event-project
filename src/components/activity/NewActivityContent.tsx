'use client'

import { ActivityForm } from '@/components/ActivityForm'
import { useTranslations } from '@/lib/use-translations'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from '@/components/error-boundary'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Dynamically import Framer Motion to avoid SSR issues
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: false }
)

interface NewActivityContentProps {
  eventId: string
}

export function NewActivityContent({ eventId }: NewActivityContentProps) {
  const { t } = useTranslations()

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          tabIndex={0}
        >
          {t('newActivity')}
        </h1>
        <p 
          className="text-gray-600 dark:text-gray-400"
          tabIndex={0}
        >
          {t('createActivityDescription')}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <ErrorBoundary fallback="Error loading activity form">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <ActivityForm eventId={eventId} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </MotionDiv>
  )
} 