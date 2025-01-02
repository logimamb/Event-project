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
import { securitySettingsSchema } from '@/lib/validations/settings'
import type { z } from 'zod'
import { Loader2, Lock, Smartphone } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type SecurityFormData = z.infer<typeof securitySettingsSchema>

export function SecuritySettings() {
  const t = useTranslations('settings.security')
  const { settings, updateSettings, isUpdating } = useSettings()

  const form = useForm<SecurityFormData>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: settings?.security || {
      twoFactorAuth: {
        enabled: false,
        method: 'app',
      },
      loginNotifications: true,
      sessionTimeout: 30,
      trustedDevices: [],
    },
  })

  const onSubmit = (data: SecurityFormData) => {
    updateSettings({ type: 'security', data })
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-5 w-5" />
            <h3 className="text-lg font-medium">{t('title')}</h3>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="twoFactorAuth.enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>{t('twoFactorAuth.title')}</FormLabel>
                    <FormDescription>
                      {t('twoFactorAuth.description')}
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

            {form.watch('twoFactorAuth.enabled') && (
              <FormField
                control={form.control}
                name="twoFactorAuth.method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('twoFactorAuth.method.title')}</FormLabel>
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
                        <SelectItem value="app">
                          {t('twoFactorAuth.method.app')}
                        </SelectItem>
                        <SelectItem value="sms">
                          {t('twoFactorAuth.method.sms')}
                        </SelectItem>
                        <SelectItem value="email">
                          {t('twoFactorAuth.method.email')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <FormField
            control={form.control}
            name="loginNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>{t('loginNotifications')}</FormLabel>
                  <FormDescription>
                    {t('loginNotificationsDescription')}
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
            name="sessionTimeout"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('sessionTimeout')}</FormLabel>
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">
                  {t('trustedDevices.title')}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t('trustedDevices.description')}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.watch('trustedDevices').map((device, index) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        {device.name}
                      </div>
                    </TableCell>
                    <TableCell>{device.lastUsed}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const devices = form.getValues('trustedDevices')
                          form.setValue(
                            'trustedDevices',
                            devices.filter((_, i) => i !== index)
                          )
                        }}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Alert>
            <AlertTitle>Security Tip</AlertTitle>
            <AlertDescription>
              {t('securityTip')}
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
