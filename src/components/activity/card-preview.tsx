'use client'

import { cn } from '@/lib/utils'
import { activityCardTemplates } from './card-templates'
import { CalendarDays, MapPin, Clock, Users, Target } from 'lucide-react'
import { format } from 'date-fns'

interface ActivityCardPreviewProps {
  templateId: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  location?: string
  capacity?: number
  difficulty?: string
  highlights?: string[]
}

export function ActivityCardPreview({
  templateId,
  title,
  description,
  startDate,
  endDate,
  location,
  capacity,
  difficulty,
  highlights = []
}: ActivityCardPreviewProps) {
  const template = activityCardTemplates.find(t => t.id === templateId) || activityCardTemplates[0]

  return (
    <div
      className={cn(
        "rounded-lg p-6 w-full transition-all",
        template.background,
        template.pattern
      )}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className={cn("text-2xl font-bold", template.textColor)}>
            {title || "Activity Title"}
          </h3>
          <p className={cn("text-sm opacity-90", template.textColor)}>
            {description || "Activity description will appear here..."}
          </p>
        </div>

        <div className="space-y-2">
          <div className={cn(
            "flex items-center gap-2 text-sm",
            template.textColor
          )}>
            <CalendarDays className="w-4 h-4" />
            <span>
              {format(startDate || new Date(), "EEEE, MMMM d, yyyy")}
            </span>
          </div>

          <div className={cn(
            "flex items-center gap-2 text-sm",
            template.textColor
          )}>
            <Clock className="w-4 h-4" />
            <span>
              {format(startDate || new Date(), "h:mm a")} - {format(endDate || new Date(), "h:mm a")}
            </span>
          </div>

          {location && (
            <div className={cn(
              "flex items-center gap-2 text-sm",
              template.textColor
            )}>
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          )}

          {capacity && (
            <div className={cn(
              "flex items-center gap-2 text-sm",
              template.textColor
            )}>
              <Users className="w-4 h-4" />
              <span>Capacity: {capacity} participants</span>
            </div>
          )}

          {difficulty && (
            <div className={cn(
              "flex items-center gap-2 text-sm",
              template.textColor
            )}>
              <Target className="w-4 h-4" />
              <span>Difficulty: {difficulty}</span>
            </div>
          )}
        </div>

        {highlights.length > 0 && (
          <div className={cn(
            "mt-4 p-4 rounded-md",
            template.accentColor
          )}>
            <div className={cn("text-sm font-medium", template.textColor)}>
              What to expect:
            </div>
            <ul className={cn(
              "list-disc list-inside text-sm mt-2 space-y-1",
              template.textColor,
              "opacity-90"
            )}>
              {highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
