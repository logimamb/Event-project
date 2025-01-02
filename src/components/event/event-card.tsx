'use client'

import { Event } from '@/types'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { generateEventPDF } from '@/lib/pdf-generator'
import { Button } from '@/components/ui/button'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/events/${event.id}`)
  }

  const handleDownloadPDF = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking download button
    generateEventPDF({
      title: event.title,
      description: event.description || '',
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      location: event.location?.name,
      capacity: event.capacity,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "group cursor-pointer",
        "relative overflow-hidden glass p-6 rounded-2xl transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5",
        "border border-gray-200/50 dark:border-gray-800/50"
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick()
        }
      }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDownloadPDF}
          >
            <Download className="w-4 h-4 mr-1" />
            PDF
          </Button>
        </div>

        {event.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 group-hover:line-clamp-none transition-all">
            {event.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1.5" />
            <time dateTime={event.startDate}>
              {format(new Date(event.startDate), 'PPp')}
            </time>
          </div>

          {event.location?.name && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1.5" />
              <span>{event.location.name}</span>
            </div>
          )}

          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1.5" />
            <span>
              {event._count?.participants || 0} participants
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <span 
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              event.status === 'DRAFT' && "bg-gray-100 text-gray-800",
              event.status === 'PUBLISHED' && "bg-green-100 text-green-800",
              event.status === 'CANCELLED' && "bg-red-100 text-red-800"
            )}
          >
            {event.status.toLowerCase()}
          </span>
        </div>
      </div>
    </motion.div>
  )
}