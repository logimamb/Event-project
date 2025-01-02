'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { activitySchema } from '@/lib/validations/activity'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { EventSelect } from '@/components/EventSelect'
import { useToast } from '@/hooks/use-toast'
import { FormField } from '@/components/ui/form-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Event } from '@/types'
import { getEvents } from '@/actions/eventActions'

interface FormData {
  title: string
  description: string
  eventId: string
  startDate: Date
  endDate: Date
  location: string
  capacity: number
}

export function NewActivityForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const result = await getEvents()
        if (result.success && result.data) {
          setEvents(result.data)
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to fetch events',
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch events',
          variant: 'destructive',
        })
      } finally {
        setIsLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [toast])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(activitySchema)
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        capacity: Number(data.capacity)
      }

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create activity')
      }

      toast({
        title: 'Success',
        description: 'Activity created successfully',
      })
      router.push('/activities')
    } catch (error) {
      console.error('Failed to create activity:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create activity',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Basic Information</h2>
          
          <FormField
            name="title"
            label="Activity Title"
            error={errors.title?.message}
          >
            <Input
              {...register('title')}
              placeholder="Enter activity title"
              className="max-w-xl"
            />
          </FormField>

          <FormField
            name="description"
            label="Description"
            error={errors.description?.message}
          >
            <Textarea
              {...register('description')}
              placeholder="Enter activity description"
              className="max-w-xl h-32"
            />
          </FormField>

          <FormField
            name="eventId"
            label="Associated Event"
            error={errors.eventId?.message}
          >
            <EventSelect
              events={events}
              value={watch('eventId')}
              onChange={(value) => setValue('eventId', value)}
              label="Select Event"
              description={isLoadingEvents ? "Loading events..." : undefined}
            />
          </FormField>
        </div>

        {/* Date and Time */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Date and Time</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              name="startDate"
              label="Start Date & Time"
              error={errors.startDate?.message}
            >
              <DateTimePicker
                date={watch('startDate')}
                setDate={(date) => setValue('startDate', date as Date)}
              />
            </FormField>

            <FormField
              name="endDate"
              label="End Date & Time"
              error={errors.endDate?.message}
            >
              <DateTimePicker
                date={watch('endDate')}
                setDate={(date) => setValue('endDate', date as Date)}
              />
            </FormField>
          </div>
        </div>

        {/* Location and Capacity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Location and Capacity</h2>
          
          <FormField
            name="location"
            label="Location"
            error={errors.location?.message}
          >
            <div className="relative max-w-xl">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...register('location')}
                placeholder="Enter activity location"
                className="pl-9"
              />
            </div>
          </FormField>

          <FormField
            name="capacity"
            label="Maximum Participants"
            error={errors.capacity?.message}
          >
            <div className="relative max-w-xl">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                placeholder="Enter maximum number of participants"
                className="pl-9"
              />
            </div>
          </FormField>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Creating Activity...' : 'Create Activity'}
        </Button>
      </div>
    </form>
  )
}
