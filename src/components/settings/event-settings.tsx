'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useSettings } from '@/hooks/use-settings'
import { eventSettingsSchema } from '@/lib/validations/settings'
import type { z } from 'zod'
import { Loader2, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

type EventFormData = z.infer<typeof eventSettingsSchema>

const DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
]

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'team', label: 'Team Only' },
]

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export function EventSettings() {
  const t = useTranslations('Settings.event')
  const { settings, updateSettings, isUpdating } = useSettings()

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSettingsSchema),
    defaultValues: settings?.event || {
      defaultEventDuration: 30,
      defaultEventVisibility: 'private',
      autoAcceptInvites: false,
      defaultReminders: [{ type: 'notification', time: 15 }],
      workingHours: {
        enabled: false,
        schedule: DAYS_OF_WEEK.map(day => ({
          day,
          start: '09:00',
          end: '17:00',
        })),
      },
    },
  })

  const onSubmit = (data: EventFormData) => {
    updateSettings({ type: 'event', data })
  }

  const addReminder = () => {
    const currentReminders = form.getValues('defaultReminders')
    form.setValue('defaultReminders', [
      ...currentReminders,
      { type: 'notification', time: 15 },
    ])
  }

  const removeReminder = (index: number) => {
    const currentReminders = form.getValues('defaultReminders')
    form.setValue('defaultReminders', currentReminders.filter((_, i) => i !== index))
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="defaultEventDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('defaultDuration')}</FormLabel>
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('defaultDurationDescription')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="defaultEventVisibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('defaultVisibility')}</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VISIBILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autoAcceptInvites"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t('autoAcceptInvites')}
                  </FormLabel>
                  <FormDescription>
                    {t('autoAcceptInvitesDescription')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>{t('reminders')}</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addReminder}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </div>
            
            {form.watch('defaultReminders').map((_, index) => (
              <div key={index} className="flex items-end gap-4">
                <FormField
                  control={form.control}
                  name={`defaultReminders.${index}.type`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">
                            {t('reminderType.email')}
                          </SelectItem>
                          <SelectItem value="notification">
                            {t('reminderType.notification')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`defaultReminders.${index}.time`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeReminder(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <FormField
            control={form.control}
            name="workingHours.enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t('workingHours.title')}
                  </FormLabel>
                  <FormDescription>
                    {t('workingHours.enabled')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch('workingHours.enabled') && (
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day, index) => (
                <div key={day} className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`workingHours.schedule.${index}.start`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{`${day} - ${t('workingHours.start')}`}</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`workingHours.schedule.${index}.end`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('workingHours.end')}</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveChanges')}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
