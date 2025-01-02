'use client'

import * as React from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
  date: Date
  setDate: (date: Date) => void
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)
  const [hour, setHour] = React.useState<number>(date.getHours())
  const [minute, setMinute] = React.useState<number>(date.getMinutes())

  // Update local state when date prop changes
  React.useEffect(() => {
    setHour(date.getHours())
    setMinute(date.getMinutes())
  }, [date])

  const updateTime = React.useCallback((newHour: number, newMinute: number) => {
    const newDate = new Date(date)
    newDate.setHours(newHour)
    newDate.setMinutes(newMinute)
    setDate(newDate)
  }, [date, setDate])

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value >= 0 && value <= 23) {
      setHour(value)
      updateTime(value, minute)
    }
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value >= 0 && value <= 59) {
      setMinute(value)
      updateTime(hour, value)
    }
  }

  const handleArrowKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement
    const value = parseInt(input.value)
    
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (input === hourRef.current && value < 23) {
        const newHour = value + 1
        setHour(newHour)
        updateTime(newHour, minute)
      } else if (input === minuteRef.current && value < 59) {
        const newMinute = value + 1
        setMinute(newMinute)
        updateTime(hour, newMinute)
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (input === hourRef.current && value > 0) {
        const newHour = value - 1
        setHour(newHour)
        updateTime(newHour, minute)
      } else if (input === minuteRef.current && value > 0) {
        const newMinute = value - 1
        setMinute(newMinute)
        updateTime(hour, newMinute)
      }
    }
  }

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <Input
          ref={hourRef}
          id="hours"
          className="w-16 text-center"
          value={hour.toString().padStart(2, "0")}
          onChange={handleHourChange}
          onKeyDown={handleArrowKeys}
          type="number"
          min={0}
          max={23}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <Input
          ref={minuteRef}
          id="minutes"
          className="w-16 text-center"
          value={minute.toString().padStart(2, "0")}
          onChange={handleMinuteChange}
          onKeyDown={handleArrowKeys}
          type="number"
          min={0}
          max={59}
        />
      </div>
      <div className="flex h-10 items-center">
        <Clock className="ml-2 h-4 w-4" />
      </div>
    </div>
  )
}
