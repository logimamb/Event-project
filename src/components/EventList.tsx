'use client'

import { Event } from '@/types'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Timer,
  XCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ShareEventDialog } from '@/components/ShareEventDialog'
import { useTranslations } from 'next-intl'

interface EventListProps {
  events: Event[]
}

interface Location {
  address?: string
  city?: string
  country?: string
}

const statusConfig = {
  DRAFT: {
    color: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    icon: Timer,
  },
  PUBLISHED: {
    color: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
    icon: CheckCircle,
  },
  CANCELLED: {
    color: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    icon: XCircle,
  },
  IN_PROGRESS: {
    color: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
    icon: AlertCircle,
  },
}

const getLocationString = (location?: Location) => {
  if (!location) return null
  return [location.address, location.city, location.country]
    .filter(Boolean)
    .join(', ')
}

export function EventList({ events = [] }: EventListProps) {
  const t = useTranslations('events')

  if (!Array.isArray(events) || events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 col-span-full"
        role="status"
        aria-label={t('noEventsFound')}
      >
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 w-16 h-16 mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-500 dark:text-gray-400" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {t('noEventsFound')}
        </h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          {t('getStarted')}
        </p>
        <div className="mt-6">
          <Link href="/events/new">
            <Button>{t('createNewEvent')}</Button>
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {events.map((event, index) => {
          const status = event.status || 'DRAFT'
          const StatusIcon = statusConfig[status]?.icon || AlertCircle
          const locationString = getLocationString(event.location)
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="group relative rounded-lg border p-6 hover:border-primary"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold leading-none tracking-tight">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </div>
                <div className={cn(
                  'rounded-lg px-2 py-1 text-xs font-semibold',
                  statusConfig[status]?.color,
                  statusConfig[status]?.text
                )}>
                  <div className="flex items-center space-x-1">
                    <StatusIcon className="h-4 w-4" />
                    <span>{t(`status.${status.toLowerCase()}`)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(event.startDate), 'PPP')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(event.startDate), 'p')} - {format(new Date(event.endDate), 'p')}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{locationString || t('virtualEvent')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{t('participations', { count: event._count?.members || 0 })}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-4">
                <Link href={`/events/${event.id}`}>
                  <Button variant="outline" size="sm">
                    {t('viewDetails')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <ShareEventDialog event={event} />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
