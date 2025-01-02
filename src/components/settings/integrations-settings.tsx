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
import { Input } from '@/components/ui/input'
import { useSettings } from '@/hooks/use-settings'
import { integrationsSettingsSchema } from '@/lib/validations/settings'
import type { z } from 'zod'
import { Loader2, Link, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type IntegrationsFormData = z.infer<typeof integrationsSettingsSchema>

export function IntegrationsSettings() {
  const t = useTranslations('settings.integrations')
  const { settings, updateSettings, isUpdating } = useSettings()

  const form = useForm<IntegrationsFormData>({
    resolver: zodResolver(integrationsSettingsSchema),
    defaultValues: settings?.integrations || {
      googleCalendar: {
        enabled: false,
        syncFrequency: 'realtime',
      },
      microsoftOutlook: {
        enabled: false,
      },
      slack: {
        enabled: false,
        channel: '',
      },
      zoom: {
        enabled: false,
        autoCreateMeeting: false,
      },
    },
  })

  const onSubmit = (data: IntegrationsFormData) => {
    updateSettings({ type: 'integrations', data })
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Link className="h-5 w-5" />
            <h3 className="text-lg font-medium">{t('title')}</h3>
          </div>

          <div className="space-y-6">
            {/* Google Calendar Integration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none">
                    {t('googleCalendar.title')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('googleCalendar.description')}
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="googleCalendar.enabled"
                  render={({ field }) => (
                    <FormItem>
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

              {form.watch('googleCalendar.enabled') && (
                <FormField
                  control={form.control}
                  name="googleCalendar.syncFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('googleCalendar.syncFrequency.title')}</FormLabel>
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
                          <SelectItem value="realtime">
                            {t('googleCalendar.syncFrequency.realtime')}
                          </SelectItem>
                          <SelectItem value="hourly">
                            {t('googleCalendar.syncFrequency.hourly')}
                          </SelectItem>
                          <SelectItem value="daily">
                            {t('googleCalendar.syncFrequency.daily')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Microsoft Outlook Integration */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">
                  {t('microsoftOutlook.title')}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t('microsoftOutlook.description')}
                </p>
              </div>
              <FormField
                control={form.control}
                name="microsoftOutlook.enabled"
                render={({ field }) => (
                  <FormItem>
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

            {/* Slack Integration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none">
                    {t('slack.title')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('slack.description')}
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="slack.enabled"
                  render={({ field }) => (
                    <FormItem>
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

              {form.watch('slack.enabled') && (
                <FormField
                  control={form.control}
                  name="slack.channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('slack.channel')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Zoom Integration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none">
                    {t('zoom.title')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('zoom.description')}
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="zoom.enabled"
                  render={({ field }) => (
                    <FormItem>
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

              {form.watch('zoom.enabled') && (
                <FormField
                  control={form.control}
                  name="zoom.autoCreateMeeting"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>{t('zoom.autoCreateMeeting')}</FormLabel>
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
              )}
            </div>
          </div>

          <Alert>
            <AlertTitle>Integration Note</AlertTitle>
            <AlertDescription className="flex items-center gap-2">
              {t('integrationNote')}
              <a
                href="/docs/integrations"
                className="inline-flex items-center gap-1 underline"
              >
                Learn more
                <ExternalLink className="h-4 w-4" />
              </a>
            </AlertDescription>
          </Alert>

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
