import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TimePicker } from "../time-picker"

export interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function DateTimePicker({
  date,
  setDate,
  className,
}: DateTimePickerProps) {
  // Initialize with current date if no date is provided
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date || new Date()
  )

  // Sync with parent's date when it changes
  React.useEffect(() => {
    if (date !== selectedDate) {
      setSelectedDate(date || new Date())
    }
  }, [date])

  // Update parent's state when selected date changes
  const handleDateChange = (newDate: Date | undefined) => {
    setSelectedDate(newDate || new Date())
    setDate(newDate || new Date())
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "PPP HH:mm:ss")
          ) : (
            <span>Pick date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          initialFocus
        />
        <div className="p-3 border-t border-border">
          <TimePicker date={selectedDate} setDate={handleDateChange} />
        </div>
      </PopoverContent>
    </Popover>
  )
} 
