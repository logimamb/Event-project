'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  const [open, setOpen] = React.useState(false)
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
        setEvents(data || [])
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

  const selectedEvent = events.find((event) => event.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedEvent ? selectedEvent.title : "Select event..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search events..." />
          <CommandEmpty>No events found.</CommandEmpty>
          <CommandGroup>
            {events.map((event) => (
              <CommandItem
                key={event.id}
                value={event.title.toLowerCase()}
                onSelect={() => {
                  onValueChange(event.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === event.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {event.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
