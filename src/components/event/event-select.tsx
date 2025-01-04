'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

interface Event {
  id: string
  title: string
}

interface EventSelectProps {
  value?: string
  onValueChange: (value: string) => void
}

export function EventSelect({ value, onValueChange }: EventSelectProps) {
  const [mounted, setMounted] = React.useState(false)
  const [events, setEvents] = React.useState<Event[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events?minimal=true')
        if (!response.ok) throw new Error('Failed to fetch events')
        const data = await response.json()
        setEvents(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      fetchEvents()
    }
  }, [mounted])

  if (!mounted || loading) {
    return <Skeleton className="h-10 w-full" />
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select event..." />
      </SelectTrigger>
      <SelectContent>
        {events.map((event) => (
          <SelectItem key={event.id} value={event.id}>
            {event.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
