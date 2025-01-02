'use client'

import * as React from "react"
import { format } from "date-fns"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TimePicker } from "./time-picker"

interface DateTimePickerProps {
  date?: Date
  setDate: (date: Date) => void
  className?: string
}

export function DateTimePicker({
  date,
  setDate,
  className,
}: DateTimePickerProps) {
  const [mounted, setMounted] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date>(date || new Date())
  const [open, setOpen] = React.useState(false)

  // Handle hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Update local state when prop changes
  React.useEffect(() => {
    if (date) {
      setSelectedDate(date)
    }
  }, [date])

  const handleDateSelect = React.useCallback((newDate: Date | undefined) => {
    if (!newDate) return
    
    const updatedDate = new Date(newDate)
    updatedDate.setHours(selectedDate.getHours())
    updatedDate.setMinutes(selectedDate.getMinutes())
    
    setSelectedDate(updatedDate)
    setDate(updatedDate)
  }, [selectedDate, setDate])

  const handleTimeChange = React.useCallback((newTime: Date) => {
    setSelectedDate(newTime)
    setDate(newTime)
  }, [setDate])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          "text-muted-foreground",
          className
        )}
      >
        <Calendar className="mr-2 h-4 w-4" />
        <span>Pick a date</span>
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {format(selectedDate, "PPP HH:mm")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          defaultMonth={selectedDate}
          initialFocus
        />
        <div className="p-3 border-t border-border">
          <TimePicker
            date={selectedDate}
            setDate={handleTimeChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
