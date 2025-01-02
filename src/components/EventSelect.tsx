'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
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

interface Event {
  id: string
  title: string
  startDate: Date | string
}

interface EventSelectProps {
  events: Event[]
  value: string
  onChange: (value: string) => void
  label?: string
  description?: string
}

export function EventSelect({ events, value, onChange, label, description }: EventSelectProps) {
  const [open, setOpen] = React.useState(false)
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
          {value ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedEvent?.title}</span>
              <span className="text-xs text-muted-foreground">
                {selectedEvent?.startDate ? formatDate(new Date(selectedEvent.startDate)) : 'No date'}
              </span>
            </div>
          ) : (
            <span>{label || 'Select event...'}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search events..." />
          <CommandEmpty>No events found.</CommandEmpty>
          <CommandGroup>
            {events.map((event) => (
              <CommandItem
                key={event.id}
                value={event.id}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? '' : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === event.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{event.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(new Date(event.startDate))}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 
