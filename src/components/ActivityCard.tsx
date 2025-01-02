'use client'

import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Languages, 
  Headphones, 
  Mic, 
  Accessibility,
  Laptop,
  FileText,
  BrainCircuit,
  UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Activity, activityStatuses, priorityLevels } from '@/lib/static-data'
import { useTranslations } from '@/lib/use-translations'

interface ActivityCardProps {
  activity: Activity
  showEventDetails?: boolean
  className?: string
}

const statusIcons = {
  [activityStatuses.PENDING]: AlertCircle,
  [activityStatuses.IN_PROGRESS]: Clock,
  [activityStatuses.COMPLETED]: CheckCircle2,
}

const priorityColors = {
  [priorityLevels.HIGH]: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  [priorityLevels.MEDIUM]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
  [priorityLevels.LOW]: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
}

const AccessibilityFeature = ({ 
  icon: Icon, 
  label, 
  available 
}: { 
  icon: React.ElementType; 
  label: string; 
  available: boolean;
}) => {
  if (!available) return null
  
  return (
    <div 
      className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
      title={label}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function ActivityCard({ activity, showEventDetails = false, className }: ActivityCardProps) {
  const { t } = useTranslations()
  const StatusIcon = statusIcons[activity.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "relative rounded-xl overflow-hidden",
        "bg-white dark:bg-gray-800",
        "border border-gray-200 dark:border-gray-700",
        "shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
    >
      {/* Background Image */}
      {activity.imageUrl && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${activity.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15
          }}
          aria-hidden="true"
        />
      )}

      {/* Priority Indicator */}
      <div 
        className={cn(
          "absolute top-0 right-0 w-16 h-16",
          "overflow-hidden"
        )}
      >
        <div 
          className={cn(
            "absolute top-0 right-0",
            "transform translate-x-1/2 -translate-y-1/2 rotate-45",
            "w-16 h-3",
            priorityColors[activity.priority]
          )}
          role="status"
          aria-label={`Priority: ${activity.priority}`}
        />
      </div>

      <div className="relative z-10 p-6 space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {/* Status Badge */}
            <div 
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                activity.status === activityStatuses.COMPLETED && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
                activity.status === activityStatuses.IN_PROGRESS && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
                activity.status === activityStatuses.PENDING && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{activity.status}</span>
            </div>

            {/* Progress Indicator */}
            {activity.progress > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${activity.progress}%` }}
                    role="progressbar"
                    aria-valuenow={activity.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.progress}%
                </span>
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activity.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {activity.description}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          {/* Time */}
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>
              {format(new Date(activity.startDate), 'p')} - {format(new Date(activity.endDate), 'p')}
            </span>
          </div>

          {/* Location */}
          {activity.location && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>{activity.location}</span>
            </div>
          )}

          {/* Assigned To */}
          {activity.assignedTo && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <UserCheck className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>{activity.assignedTo}</span>
            </div>
          )}

          {/* Prerequisites */}
          {activity.prerequisites && activity.prerequisites.length > 0 && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <BrainCircuit className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>{activity.prerequisites.join(', ')}</span>
            </div>
          )}

          {/* Materials */}
          {activity.materials && activity.materials.length > 0 && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>{activity.materials.join(', ')}</span>
            </div>
          )}

          {/* Equipment */}
          {activity.equipment && activity.equipment.length > 0 && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Laptop className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>{activity.equipment.join(', ')}</span>
            </div>
          )}

          {/* Capacity */}
          {activity.maxParticipants && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Users className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Max {activity.maxParticipants} participants</span>
            </div>
          )}
        </div>

        {/* Accessibility Features */}
        {activity.accessibility && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <AccessibilityFeature
              icon={Languages}
              label="Sign Language Interpreter Available"
              available={activity.accessibility.signLanguageInterpreter}
            />
            <AccessibilityFeature
              icon={Headphones}
              label="Closed Captioning Available"
              available={activity.accessibility.captioning}
            />
            <AccessibilityFeature
              icon={Mic}
              label="Audio Description Available"
              available={activity.accessibility.audioDescription}
            />
            <AccessibilityFeature
              icon={Accessibility}
              label="Wheelchair Accessible"
              available={activity.accessibility.wheelchairAccessible}
            />
          </div>
        )}

        {/* Additional Information */}
        {activity.notes && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {activity.notes}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
} 