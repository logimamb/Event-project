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
import { privacySettingsSchema } from '@/lib/validations/settings'
import type { z } from 'zod'
import { Loader2, Shield } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type PrivacyFormData = z.infer<typeof privacySettingsSchema>

export function PrivacySettings() {
  const t = useTranslations('settings.privacy')
  const { settings, updateSettings, isUpdating } = useSettings()

  const form = useForm<PrivacyFormData>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: settings?.privacy || {
      profileVisibility: 'team',
      calendarVisibility: 'private',
      activityVisibility: 'team',
      showUpcomingEvents: true,
      allowTagging: true,
      allowComments: true,
    },
  })

  const onSubmit = (data: PrivacyFormData) => {
    updateSettings({ type: 'privacy', data })
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5" />
            <h3 className="text-lg font-medium">{t('title')}</h3>
          </div>

          <Alert>
            <AlertTitle>{t('privacyNote')}</AlertTitle>
            <AlertDescription>{t('privacyDescription')}</AlertDescription>
          </Alert>

          <FormField
            control={form.control}
            name="profileVisibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profileVisibility')}</FormLabel>
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
                    <SelectItem value="public">
                      {t('visibilityOptions.public')}
                    </SelectItem>
                    <SelectItem value="team">
                      {t('visibilityOptions.team')}
                    </SelectItem>
                    <SelectItem value="private">
                      {t('visibilityOptions.private')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="calendarVisibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('calendarVisibility')}</FormLabel>
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
                    <SelectItem value="public">
                      {t('visibilityOptions.public')}
                    </SelectItem>
                    <SelectItem value="team">
                      {t('visibilityOptions.team')}
                    </SelectItem>
                    <SelectItem value="private">
                      {t('visibilityOptions.private')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activityVisibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('activityVisibility')}</FormLabel>
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
                    <SelectItem value="public">
                      {t('visibilityOptions.public')}
                    </SelectItem>
                    <SelectItem value="team">
                      {t('visibilityOptions.team')}
                    </SelectItem>
                    <SelectItem value="private">
                      {t('visibilityOptions.private')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showUpcomingEvents"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>{t('showUpcomingEvents')}</FormLabel>
                  <FormDescription>
                    {t('showUpcomingEventsDescription')}
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

          <FormField
            control={form.control}
            name="allowTagging"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>{t('allowTagging')}</FormLabel>
                  <FormDescription>
                    {t('allowTaggingDescription')}
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

          <FormField
            control={form.control}
            name="allowComments"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>{t('allowComments')}</FormLabel>
                  <FormDescription>
                    {t('allowCommentsDescription')}
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
