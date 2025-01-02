'use client'

import { ActivityForm } from '@/components/ActivityForm'
import { useTranslations } from '@/lib/use-translations'
import { useEffect, useState } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface NewActivityContentProps {
  eventId: string
}

export function NewActivityContent({ eventId }: NewActivityContentProps) {
  const { t } = useTranslations()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div
      className={`max-w-2xl mx-auto transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
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
    </div>
  )
} 