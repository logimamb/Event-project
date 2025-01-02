'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import { profileSettingsSchema } from '@/lib/validations/settings'
import type { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type ProfileFormData = z.infer<typeof profileSettingsSchema>

export function ProfileSettings() {
  const t = useTranslations('settings.profile')
  const { settings, updateSettings, isUpdating } = useSettings()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: settings?.profile || {
      displayName: '',
      bio: '',
      organization: '',
      role: '',
      website: '',
      socialLinks: {
        linkedin: '',
        twitter: '',
        github: '',
      },
    },
  })

  const onSubmit = (data: ProfileFormData) => {
    updateSettings({ type: 'profile', data })
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('displayName')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>{t('displayNameDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bio')}</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormDescription>{t('bioDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('organization')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('role')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('website')}</FormLabel>
                <FormControl>
                  <Input {...field} type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <Label>{t('socialLinks')}</Label>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <FormField
                control={form.control}
                name="socialLinks.linkedin"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="LinkedIn" />
                              <div className="absolute inset-y-0 left-3 flex items-center">
                                <i className="fab fa-linkedin text-muted-foreground" />
                              </div>
                            </div>
                          </FormControl>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('linkedinTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialLinks.twitter"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="Twitter" />
                              <div className="absolute inset-y-0 left-3 flex items-center">
                                <i className="fab fa-twitter text-muted-foreground" />
                              </div>
                            </div>
                          </FormControl>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('twitterTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialLinks.github"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="GitHub" />
                              <div className="absolute inset-y-0 left-3 flex items-center">
                                <i className="fab fa-github text-muted-foreground" />
                              </div>
                            </div>
                          </FormControl>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('githubTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
