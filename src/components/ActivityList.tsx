'use client'

import { Activity } from '@/types'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from '@/lib/use-translations'
import { format } from 'date-fns'
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserIcon,
  AccessibilityIcon,
  ShareIcon,
  UsersIcon,
  CheckIcon,
  XIcon,
  AlertCircleIcon
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ActivityListProps {
  activities: Activity[]
  eventId: string
}

const statusConfig = {
  PENDING: {
    icon: AlertCircleIcon,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
  },
  IN_PROGRESS: {
    icon: ClockIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20'
  },
  COMPLETED: {
    icon: CheckIcon,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/20'
  },
  CANCELLED: {
    icon: XIcon,
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/20'
  }
}

export function ActivityList({ activities, eventId }: ActivityListProps) {
  const { t } = useTranslations()

  if (!activities?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {t('noActivities')}
        </p>
        <Link href={`/events/${eventId}/activities/new`}>
          <Button>
            {t('createFirstActivity')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {activities.map((activity) => {
        const StatusIcon = statusConfig[activity.status]?.icon || AlertCircleIcon
        const statusColor = statusConfig[activity.status]?.color || 'text-gray-500'
        const statusBgColor = statusConfig[activity.status]?.bgColor || 'bg-gray-100'
        const participationRate = activity.capacity 
          ? (activity.participants?.length || 0) / activity.capacity * 100
          : 0

        return (
          <Card key={activity.id} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="truncate">{activity.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{activity.description}</CardDescription>
                </div>
                <Badge 
                  variant="secondary"
                  className={cn(statusBgColor, statusColor, "whitespace-nowrap")}
                >
                  <StatusIcon className="w-4 h-4 mr-1" />
                  {t(activity.status.toLowerCase())}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate">
                    {format(new Date(activity.startTime), 'PPP')} - {format(new Date(activity.endTime), 'PPP')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ClockIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate">
                    {format(new Date(activity.startTime), 'p')} - {format(new Date(activity.endTime), 'p')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPinIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate">
                    {activity.location || t('locationTBA')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UsersIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm">
                    {activity.participants?.length || 0} / {activity.capacity || '∞'}
                  </span>
                </div>
              </div>

              {activity.capacity > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{t('participation')}</span>
                    <span>{Math.round(participationRate)}%</span>
                  </div>
                  <Progress value={participationRate} />
                </div>
              )}

              {activity.accessibility && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                        <AccessibilityIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate">{t('accessibilityAvailable')}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{activity.accessibility.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                <Link href={`/activities/${activity.id}`}>
                  {t('viewDetails')}
                </Link>
              </Button>
              {activity.status === 'PENDING' && (
                <Button size="sm" asChild className="w-full sm:w-auto">
                  <Link href={`/activities/${activity.id}/join`}>
                    {t('joinActivity')}
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
} 
