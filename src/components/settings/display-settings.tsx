'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { displaySettingsSchema } from '@/lib/validations/settings'
import type { z } from 'zod'
import { Loader2, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

type DisplayFormData = z.infer<typeof displaySettingsSchema>

export function DisplaySettings() {
  const t = useTranslations('settings.display')
  const { settings, updateSettings, isUpdating } = useSettings()
  const { setTheme } = useTheme()

  const form = useForm<DisplayFormData>({
    resolver: zodResolver(displaySettingsSchema),
    defaultValues: settings?.display || {
      theme: 'system',
      density: 'comfortable',
      timeFormat: '12h',
      dateFormat: 'MMDDYYYY',
    },
  })

  const onSubmit = (data: DisplayFormData) => {
    updateSettings({ type: 'display', data })
    setTheme(data.theme)
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Monitor className="h-5 w-5" />
            <h3 className="text-lg font-medium">{t('title')}</h3>
          </div>

          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('theme.title')}</FormLabel>
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
                    <SelectItem value="light">{t('theme.light')}</SelectItem>
                    <SelectItem value="dark">{t('theme.dark')}</SelectItem>
                    <SelectItem value="system">{t('theme.system')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="density"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('density.title')}</FormLabel>
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
                    <SelectItem value="comfortable">
                      {t('density.comfortable')}
                    </SelectItem>
                    <SelectItem value="compact">
                      {t('density.compact')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {field.value === 'comfortable'
                    ? t('density.comfortableDescription')
                    : t('density.compactDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('timeFormat.title')}</FormLabel>
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
                    <SelectItem value="12h">{t('timeFormat.12h')}</SelectItem>
                    <SelectItem value="24h">{t('timeFormat.24h')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('dateFormat.title')}</FormLabel>
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
                    <SelectItem value="MMDDYYYY">
                      {t('dateFormat.options.MMDDYYYY')}
                    </SelectItem>
                    <SelectItem value="DDMMYYYY">
                      {t('dateFormat.options.DDMMYYYY')}
                    </SelectItem>
                    <SelectItem value="YYYYMMDD">
                      {t('dateFormat.options.YYYYMMDD')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
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
