'use client'

import { cn } from "@/lib/utils"
import { format, isSameDay } from "date-fns"
import { MapPin, Calendar, Clock } from "lucide-react"
import { useTranslations } from 'next-intl'
import { CardTemplate, cardTemplates } from "./card-templates"

interface CardPreviewProps {
  templateId: string
  title: string
  description?: string
  location?: string
  startDate?: Date | null
  endDate?: Date | null
  startTime?: string
  endTime?: string
  highlights: string[]
}

export function CardPreview({
  templateId,
  title,
  description,
  location,
  startDate,
  endDate,
  startTime,
  endTime,
  highlights,
}: CardPreviewProps) {
  const t = useTranslations('events')
  const template = cardTemplates.find((t) => t.id === templateId) || cardTemplates[0]

  const formattedStartDate = startDate ? format(startDate, "PPP") : ""
  const formattedEndDate = endDate ? format(endDate, "PPP") : ""
  const showDateRange = startDate && endDate && !isSameDay(startDate, endDate)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg p-6 sm:p-8",
        template.background,
        template.pattern,
        template.textColor
      )}
    >
      <div className="relative z-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{title}</h2>
        {description && (
          <p className="text-sm sm:text-base opacity-90 mb-4">{description}</p>
        )}

        <div className="space-y-2 mb-6">
          {location && (
            <div className="flex items-center text-sm sm:text-base">
              <MapPin className="w-4 h-4 mr-2 opacity-70" />
              <span>{location}</span>
            </div>
          )}
          {formattedStartDate && (
            <div className="flex items-center text-sm sm:text-base">
              <Calendar className="w-4 h-4 mr-2 opacity-70" />
              <span>
                {formattedStartDate}
                {showDateRange && ` - ${formattedEndDate}`}
              </span>
            </div>
          )}
          {startTime && endTime && (
            <div className="flex items-center text-sm sm:text-base">
              <Clock className="w-4 h-4 mr-2 opacity-70" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>
          )}
        </div>

        {highlights.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm sm:text-base">{t('form.highlights')}</h3>
            <div className="grid gap-2">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className={cn(
                    "px-3 py-1 rounded text-sm sm:text-base",
                    template.accentColor
                  )}
                >
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className={cn(
          "absolute inset-0 opacity-50",
          template.pattern
        )}
      />
    </div>
  )
}
