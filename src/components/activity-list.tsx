'use client'

import { Activity } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle2, Circle, AlertCircle, Calendar } from 'lucide-react'
import { ActivityActions } from './ActivityActions'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './ui/loading-spinner'
import { Alert, AlertDescription } from "@/components/ui/alert"
import React from 'react'
import { PreviewModal } from './shared/preview-modal'

interface ActivityListProps {
  activities: (Activity & {
    formattedStartDate: string
    formattedEndDate: string
  })[]
  onStatusChange?: (id: string, status: string) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
}

const statusIcons = {
  'PENDING': Circle,
  'IN_PROGRESS': AlertCircle,
  'COMPLETED': CheckCircle2,
}

const statusColors = {
  'PENDING': 'text-yellow-500 dark:text-yellow-400',
  'IN_PROGRESS': 'text-blue-500 dark:text-blue-400',
  'COMPLETED': 'text-green-500 dark:text-green-400',
}

const statusBackgrounds = {
  'PENDING': 'bg-yellow-50 dark:bg-yellow-500/10',
  'IN_PROGRESS': 'bg-blue-50 dark:bg-blue-500/10',
  'COMPLETED': 'bg-green-50 dark:bg-green-500/10',
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: "afterChildren"
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export function ActivityList({ 
  activities, 
  onStatusChange, 
  onDelete,
  isLoading = false 
}: ActivityListProps) {
  const [selectedActivity, setSelectedActivity] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewActivity, setPreviewActivity] = React.useState<any>(null);

  const handleActivityClick = (activity: any) => {
    setSelectedActivity(activity.id);
    setPreviewActivity(activity);
    setShowPreview(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] glass rounded-2xl p-8">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">
          Loading activities...
        </p>
      </div>
    )
  }

  if (!activities?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center glass rounded-2xl p-8"
      >
        <div className="mb-4">
          <Circle className="w-12 h-12 text-gray-400 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No activities yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create your first activity using the form
        </p>
      </motion.div>
    )
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {activities?.length > 0 ? (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-4"
          >
            {activities.map((activity) => {
              const StatusIcon = statusIcons[activity.status as keyof typeof statusIcons]
              const statusColor = statusColors[activity.status as keyof typeof statusColors]
              const statusBg = statusBackgrounds[activity.status as keyof typeof statusBackgrounds]
              
              const endDate = new Date(activity.endDate)
              const now = new Date()
              const isOverdue = !isNaN(endDate.getTime()) && endDate < now && activity.status !== 'COMPLETED'

              return (
                <motion.div
                  key={activity.id}
                  variants={itemVariants}
                  layout
                  className="relative"
                  layoutId={activity.id}
                >
                  {/* Background gradient */}
                  <div 
                    className={cn(
                      "absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-50",
                      statusBg
                    )}
                  />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                          <StatusIcon 
                            className={cn(
                              "w-6 h-6 transition-transform duration-300 group-hover:scale-110",
                              statusColor
                            )}
                            aria-hidden="true"
                          />
                          <motion.div
                            className={cn(
                              "absolute inset-0 rounded-full",
                              statusColor
                            )}
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ opacity: 0.2 }}
                          />
                        </div>
                        <h3 
                          className="font-semibold text-lg truncate dark:text-white"
                          tabIndex={0}
                        >
                          {activity.title}
                        </h3>
                      </div>

                      <p 
                        className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 group-hover:line-clamp-none transition-all duration-300"
                        tabIndex={0}
                      >
                        {activity.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div 
                          className="flex items-center"
                          aria-label="Start date"
                        >
                          <Calendar className="w-4 h-4 mr-1.5" aria-hidden="true" />
                          <time dateTime={activity.startDate}>
                            {activity.formattedStartDate}
                          </time>
                        </div>

                        <div 
                          className="flex items-center"
                          aria-label="Due date"
                        >
                          <Clock className="w-4 h-4 mr-1.5" aria-hidden="true" />
                          <time dateTime={activity.endDate}>
                            {activity.formattedEndDate}
                          </time>
                        </div>

                        {isOverdue && (
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            role="alert"
                          >
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>

                    {onStatusChange && onDelete && (
                      <ActivityActions
                        activityId={activity.id}
                        status={activity.status}
                        onStatusChange={onStatusChange}
                        onDelete={onDelete}
                      />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {selectedActivity && (
        <Alert>
          <AlertDescription>
            The selected activity card will be used to generate your PDF. Please ensure all details are correct before downloading.
          </AlertDescription>
        </Alert>
      )}
      {previewActivity && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setPreviewActivity(null);
          }}
          design="modern"
          data={previewActivity}
          type="activity"
        />
      )}
    </>
  )
}
