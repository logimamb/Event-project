'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSession } from 'next-auth/react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Calendar {
  id: string
  summary: string
  description?: string
  primary: boolean
}

interface CalendarResponse {
  calendars: Calendar[]
  hasIntegration: boolean
}

export function CalendarSelect() {
  const { data: session } = useSession()
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCalendar, setSelectedCalendar] = useState<string>('')
  const [hasIntegration, setHasIntegration] = useState(false)

  useEffect(() => {
    async function fetchCalendars() {
      if (!session?.user?.id) {
        console.log('No session found in CalendarSelect')
        return
      }

      try {
        console.log('Fetching calendars...')
        const response = await fetch('/api/google/calendars')
        const data: CalendarResponse = await response.json()
        console.log('Calendar response:', data)
        
        setHasIntegration(data.hasIntegration)
        if (data.hasIntegration && data.calendars.length > 0) {
          console.log('Setting calendars:', data.calendars)
          setCalendars(data.calendars)
          // Set the primary calendar as default if available
          const primaryCalendar = data.calendars.find(cal => cal.primary)
          const defaultCalendar = primaryCalendar || data.calendars[0]
          
          if (defaultCalendar) {
            console.log('Setting default calendar:', defaultCalendar)
            setSelectedCalendar(defaultCalendar.id)
            // Create a hidden input to store the value for form submission
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = 'googleCalendarId'
            input.value = defaultCalendar.id
            
            // Remove any existing hidden input
            const existingInput = document.querySelector('input[name="googleCalendarId"]')
            if (existingInput) {
              existingInput.remove()
            }
            
            // Add the new input to the form
            const form = document.querySelector('form')
            if (form) {
              form.appendChild(input)
              console.log('Added calendar ID to form:', defaultCalendar.id)
            } else {
              console.log('Form not found')
            }
          }
        } else {
          console.log('No calendars found or no integration')
        }
      } catch (err) {
        console.error('Failed to fetch calendars:', err)
        setError('Failed to load calendars')
      } finally {
        setLoading(false)
      }
    }

    fetchCalendars()
  }, [session?.user?.id])

  const handleCalendarChange = (value: string) => {
    setSelectedCalendar(value)
    // Create a hidden input to store the value for form submission
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'googleCalendarId'
    input.value = value
    
    // Remove any existing hidden input
    const existingInput = document.querySelector('input[name="googleCalendarId"]')
    if (existingInput) {
      existingInput.remove()
    }
    
    // Add the new input to the form
    const form = document.querySelector('form')
    if (form) {
      form.appendChild(input)
    }
  }

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Loading calendars..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (error) {
    return (
      <>
        <Select disabled>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Error loading calendars" />
          </SelectTrigger>
        </Select>
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </>
    )
  }

  if (!hasIntegration) {
    return (
      <>
        <Select disabled>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="No Google Calendar connected" />
          </SelectTrigger>
        </Select>
        <p className="text-sm text-muted-foreground mt-2">
          Connect your Google Calendar in settings to enable calendar selection
        </p>
      </>
    )
  }

  if (calendars.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="No calendars available" />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={selectedCalendar} onValueChange={handleCalendarChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a calendar">
          {calendars.find(cal => cal.id === selectedCalendar)?.summary || "Select a calendar"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {calendars.map((calendar) => (
          <SelectItem 
            key={calendar.id} 
            value={calendar.id}
          >
            <div className="flex items-center gap-2">
              <span>{calendar.summary}</span>
              {calendar.primary && (
                <span className="text-xs text-muted-foreground ml-2">(Primary)</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
