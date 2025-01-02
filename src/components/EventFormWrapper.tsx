'use client'

import { EventForm } from '@/components/EventForm'
import { useEffect, useState } from 'react'

interface Event {
  id: string
  title: string
  description: string
  location: string
  startDate: Date
  endDate: Date
}

interface Translations {
  createEvent: string
  title: string
  enterTitle: string
  description: string
  enterDescription: string
  location: string
  enterLocation: string
  startDateTime: string
  endDateTime: string
  pickDate: string
  startTime: string
  dateError: string
}

interface EventFormWrapperProps {
  event?: Event
  messages: any
  translations: Translations
}

export function EventFormWrapper({ event, messages, translations }: EventFormWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // Prevent hydration issues
  }

  return <EventForm event={event} messages={messages} translations={translations} />
} 
