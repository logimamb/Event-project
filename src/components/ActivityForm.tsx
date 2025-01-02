'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/lib/use-translations'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createActivity, updateActivity } from '@/actions/activity'
import { cn } from '@/lib/utils'
import { addDays, isBefore, isAfter } from 'date-fns'
import { useFormError } from '@/hooks/use-form-error'
import { useNotifications } from '@/store/notifications'
import { motion } from 'framer-motion'

interface ActivityFormProps {
  eventId: string
  activity?: {
    id: string
    title: string
    description: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    startDate: Date
    endDate: Date
    location: string
    capacity: number
  }
}

export function ActivityForm({ eventId, activity }: ActivityFormProps) {
  const router = useRouter()
  const { t } = useTranslations()
  const { addNotification } = useNotifications()
  const [isPending, startTransition] = useTransition()
  const { formError, setFormError } = useFormError()

  // Form state
  const [startDate, setStartDate] = useState<Date | undefined>(
    activity?.startDate || new Date()
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    activity?.endDate || addDays(new Date(), 1)
  )

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        // Add IDs for updates
        if (activity?.id) {
          formData.append('id', activity.id)
        }
        formData.append('eventId', eventId)
        formData.append('startDate', startDate?.toISOString() || '')
        formData.append('endDate', endDate?.toISOString() || '')

        // Validate dates
        if (!startDate || !endDate) {
          setFormError('Please select both start and end dates')
          return
        }

        if (isBefore(endDate, startDate)) {
          setFormError('End date must be after start date')
          return
        }

        const result = activity
          ? await updateActivity(formData)
          : await createActivity(formData)

        if (!result.success) {
          setFormError(result.error || 'Something went wrong')
          return
        }

        addNotification({
          type: 'success',
          title: t('success'),
          message: activity
            ? t('activityUpdated')
            : t('activityCreated'),
        })

        router.push(`/events/${eventId}/activities`)
        router.refresh()
      } catch (error) {
        console.error('Failed to save activity:', error)
        setFormError('Failed to save activity')
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form
        action={onSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="title">{t('title')} *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={activity?.title}
            required
            disabled={isPending}
            placeholder={t('enterTitle')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('description')} *</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={activity?.description}
            required
            disabled={isPending}
            placeholder={t('enterDescription')}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">{t('location')} *</Label>
          <Input
            id="location"
            name="location"
            defaultValue={activity?.location}
            required
            disabled={isPending}
            placeholder={t('enterLocation')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">{t('capacity')} *</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            defaultValue={activity?.capacity?.toString()}
            required
            min="1"
            disabled={isPending}
            placeholder={t('enterCapacity')}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('startDate')} *</Label>
            <div className="relative">
              <DateTimePicker
                date={startDate}
                setDate={setStartDate}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('endDate')} *</Label>
            <div className="relative">
              <DateTimePicker
                date={endDate}
                setDate={setEndDate}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('status')}</Label>
          <Select
            name="status"
            defaultValue={activity?.status || 'PENDING'}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">{t('pending')}</SelectItem>
              <SelectItem value="IN_PROGRESS">{t('inProgress')}</SelectItem>
              <SelectItem value="COMPLETED">{t('completed')}</SelectItem>
              <SelectItem value="CANCELLED">{t('cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {formError}
          </motion.p>
        )}

        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
          >
            {isPending ? t('loading') : activity ? t('save') : t('createActivity')}
          </Button>
        </div>
      </form>
    </motion.div>
  )
} 