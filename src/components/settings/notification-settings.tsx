'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
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
import { notificationSettingsSchema } from '@/lib/validations/settings'
import type { z } from 'zod'
import { Loader2, Bell, Volume2, Mail } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type NotificationFormData = z.infer<typeof notificationSettingsSchema>

export function NotificationSettings() {
  const t = useTranslations('Settings.notifications')
  const { settings, updateSettings, isUpdating } = useSettings()

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: settings?.notification || {
      email: {
        eventInvites: true,
        eventReminders: true,
        eventUpdates: true,
        activityComments: true,
        dailyDigest: false,
        weeklyReport: false
      },
      push: {
        enabled: true,
        eventStart: true,
        eventReminders: [15, 30],
        mentions: true,
        teamUpdates: true
      },
      sound: {
        enabled: true,
        volume: 50,
        type: 'default'
      }
    },
  })

  const onSubmit = (data: NotificationFormData) => {
    updateSettings({ type: 'notification', data })
  }

  // Check if browser supports notifications
  const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {!notificationsSupported && (
            <Alert variant="destructive">
              <Bell className="h-4 w-4" />
              <AlertTitle>{t('notSupported')}</AlertTitle>
              <AlertDescription>{t('browserNotSupported')}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <h3 className="text-lg font-medium">{t('email.title')}</h3>
            </div>

            <FormField
              control={form.control}
              name="email.eventInvites"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>{t('email.eventInvites')}</FormLabel>
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

            <FormField
              control={form.control}
              name="email.eventReminders"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>{t('email.eventReminders')}</FormLabel>
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

            <FormField
              control={form.control}
              name="email.dailyDigest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>{t('email.dailyDigest')}</FormLabel>
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

            <FormField
              control={form.control}
              name="email.weeklyReport"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>{t('email.weeklyReport')}</FormLabel>
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
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="text-lg font-medium">{t('push.title')}</h3>
            </div>

            <FormField
              control={form.control}
              name="push.enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>{t('push.enabled')}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!notificationsSupported}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('push.enabled') && (
              <>
                <FormField
                  control={form.control}
                  name="push.eventStart"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>{t('push.eventStart')}</FormLabel>
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

                <FormField
                  control={form.control}
                  name="push.mentions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>{t('push.mentions')}</FormLabel>
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
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              <h3 className="text-lg font-medium">{t('sound.title')}</h3>
            </div>

            <FormField
              control={form.control}
              name="sound.enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>{t('sound.enabled')}</FormLabel>
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

            {form.watch('sound.enabled') && (
              <>
                <FormField
                  control={form.control}
                  name="sound.volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('sound.volume')}</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          max={100}
                          step={1}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sound.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('sound.type')}</FormLabel>
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
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="subtle">Subtle</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

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
