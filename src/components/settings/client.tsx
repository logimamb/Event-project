'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useNotifications } from '@/hooks/use-notifications'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GoogleCalendarIntegration } from '@/components/integrations/GoogleCalendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { useTranslations, useLocale } from 'next-intl'
import { countries } from '@/lib/countries'
import { timezones } from '@/lib/timezones'
import { Badge } from '@/components/ui/badge'
import { 
  CalendarDays, 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  Volume2,
  AlertTriangle,
  Info,
  User,
  Settings,
  Globe,
  Lock,
  Plug,
  Shield
} from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' }
]

export default function SettingsClient() {
  const t = useTranslations('settings')
  const { data: session, update } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const { toast } = useToast()

  const { 
    isSupported, 
    permissionStatus,
    settings: notificationSettings,
    requestPermissions,
    sendNotification,
    updateSettings
  } = useNotifications()

  const [formData, setFormData] = useState({
    // Profile Settings
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    bio: '',
    website: '',
    company: '',
    location: '',
    language: locale || 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Integration Settings
    googleCalendarEnabled: false,
    googleCalendarLastSync: null,
    slackEnabled: false,
    slackWebhook: '',
    apiKey: '',
    webhookUrl: '',
    
    // Notification Settings
    emailNotifications: true,
    desktopNotifications: notificationSettings.desktop,
    notificationSound: notificationSettings.sound,
    notificationVolume: 80,
    eventReminders: true,
    reminderTime: '30',
    inAppNotifications: true,
    emailDigest: 'daily',
    mentionNotifications: true,
    commentNotifications: true,
    
    // Privacy Settings
    profileVisibility: 'public',
    calendarVisibility: 'private',
    activityVisibility: 'friends',
    
    // Security Settings
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: '30'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isTestingNotification, setIsTestingNotification] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const [announcement, setAnnouncement] = useState('')
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [announcement])

  // Notification Handlers
  const handleRequestPermissions = async () => {
    const granted = await requestPermissions()
    if (granted) {
      setFormData(prev => ({
        ...prev,
        desktopNotifications: true
      }))
      updateSettings({ desktop: true })
      toast({
        title: t('notifications.permissionGranted'),
        description: t('notifications.notificationsEnabled'),
      })
    } else {
      toast({
        title: t('notifications.permissionDenied'),
        description: t('notifications.checkBrowserSettings'),
        variant: 'destructive'
      })
    }
  }

  const handleNotificationTest = async () => {
    setIsTestingNotification(true)
    try {
      if (permissionStatus !== 'granted') {
        const granted = await requestPermissions()
        if (!granted) {
          toast({
            title: t('notifications.permission_required'),
            description: t('notifications.enable_in_browser'),
            variant: 'destructive'
          })
          return
        }
      }

      sendNotification(
        t('notifications.test_title'),
        {
          body: t('notifications.test_body'),
          icon: '/icons/notification-icon.png'
        }
      )

      toast({
        title: t('notifications.test_sent'),
        description: t('notifications.check_notification'),
      })
    } catch (error) {
      console.error('Error testing notification:', error)
      toast({
        title: t('notifications.test_failed'),
        description: t('notifications.try_again'),
        variant: 'destructive'
      })
    } finally {
      setIsTestingNotification(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to update settings')

      toast({
        title: t('updateSuccess'),
        description: t('settingsUpdated'),
      })

      if (formData.language !== locale) {
        router.push(pathname.replace(`/${locale}/`, `/${formData.language}/`))
      }

      await update()
    } catch (error) {
      console.error('Error updating settings:', error)
      toast({
        title: t('error'),
        description: t('updateError'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('profile.title')}
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            {t('integrations.title')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t('notifications.title')}
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {t('privacy.title')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('security.title')}
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          {/* Profile Section */}
          <TabsContent value="profile">
            <Card className="p-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('profile.name')}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('profile.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">{t('profile.bio')}</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="website">{t('profile.website')}</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">{t('profile.company')}</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language">{t('profile.language')}</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value: string) => {
                          setFormData(prev => ({
                            ...prev,
                            language: value
                          }))
                        }}
                      >
                        <SelectTrigger className="w-full">
                          {formData.language || t('profile.selectLanguage')}
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">{t('profile.timezone')}</Label>
                      <Select
                        value={formData.timezone}
                        onValueChange={(value: string) => {
                          setFormData(prev => ({
                            ...prev,
                            timezone: value
                          }))
                        }}
                      >
                        <SelectTrigger className="w-full">
                          {formData.timezone || t('profile.selectTimezone')}
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz} value={tz}>
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Integrations Section */}
          <TabsContent value="integrations">
            <Card className="p-6">
              <div className="space-y-8">
                {/* Google Calendar Integration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {t('integrations.googleCalendar')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('integrations.googleCalendarDescription')}
                      </p>
                    </div>
                    <GoogleCalendarIntegration
                      enabled={formData.googleCalendarEnabled}
                      onToggle={(enabled) => {
                        setFormData(prev => ({
                          ...prev,
                          googleCalendarEnabled: enabled
                        }))
                      }}
                      lastSync={formData.googleCalendarLastSync}
                    />
                  </div>
                </div>

                {/* Slack Integration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {t('integrations.slack')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('integrations.slackDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={formData.slackEnabled}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          slackEnabled: checked
                        }))
                      }}
                    />
                  </div>
                  {formData.slackEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="slackWebhook">
                        {t('integrations.slackWebhook')}
                      </Label>
                      <Input
                        id="slackWebhook"
                        value={formData.slackWebhook}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          slackWebhook: e.target.value
                        }))}
                        placeholder="https://hooks.slack.com/services/..."
                      />
                    </div>
                  )}
                </div>

                {/* API Access */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Plug className="h-4 w-4" />
                      {t('integrations.apiAccess')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('integrations.apiAccessDescription')}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">
                        {t('integrations.apiKey')}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="apiKey"
                          value={formData.apiKey}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            apiKey: e.target.value
                          }))}
                          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            // Generate new API key
                          }}
                        >
                          {t('integrations.generateKey')}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">
                        {t('integrations.webhookUrl')}
                      </Label>
                      <Input
                        id="webhookUrl"
                        value={formData.webhookUrl}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          webhookUrl: e.target.value
                        }))}
                        placeholder="https://your-domain.com/webhook"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Section */}
          <TabsContent value="notifications">
            <Card className="p-6">
              <div className="space-y-8">
                {/* Notification Support Warning */}
                {!isSupported && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('notifications.notSupported')}</AlertTitle>
                    <AlertDescription>
                      {t('notifications.browserNotSupported')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Permission Request */}
                {isSupported && permissionStatus === 'default' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>{t('notifications.permissionNeeded')}</AlertTitle>
                    <AlertDescription className="space-y-4">
                      <p>{t('notifications.permissionDescription')}</p>
                      <Button
                        type="button"
                        onClick={handleRequestPermissions}
                        className="mt-2"
                      >
                        {t('notifications.requestPermission')}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Permission Denied Warning */}
                {isSupported && permissionStatus === 'denied' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('notifications.permissionDenied')}</AlertTitle>
                    <AlertDescription>
                      {t('notifications.checkBrowserSettings')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Email Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label 
                        htmlFor="emailNotifications"
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        {t('notifications.email')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('notifications.emailDescription')}
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          emailNotifications: checked
                        }))
                      }}
                    />
                  </div>

                  {formData.emailNotifications && (
                    <div className="ml-6">
                      <Label htmlFor="emailDigest" className="mb-2 block">
                        {t('notifications.emailDigest')}
                      </Label>
                      <RadioGroup
                        id="emailDigest"
                        value={formData.emailDigest}
                        onValueChange={(value) => {
                          setFormData(prev => ({
                            ...prev,
                            emailDigest: value
                          }))
                        }}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="instant" id="digest-instant" />
                          <Label htmlFor="digest-instant">
                            {t('notifications.digestInstant')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="daily" id="digest-daily" />
                          <Label htmlFor="digest-daily">
                            {t('notifications.digestDaily')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekly" id="digest-weekly" />
                          <Label htmlFor="digest-weekly">
                            {t('notifications.digestWeekly')}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>

                {/* Desktop Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label 
                        htmlFor="desktopNotifications"
                        className="flex items-center gap-2"
                      >
                        <Bell className="h-4 w-4" />
                        {t('notifications.desktop')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('notifications.desktopDescription')}
                      </p>
                    </div>
                    <Switch
                      id="desktopNotifications"
                      checked={formData.desktopNotifications}
                      onCheckedChange={(checked) => {
                        if (checked && permissionStatus !== 'granted') {
                          handleRequestPermissions()
                          return
                        }
                        setFormData(prev => ({
                          ...prev,
                          desktopNotifications: checked
                        }))
                        updateSettings({ desktop: checked })
                      }}
                      disabled={!isSupported || permissionStatus === 'denied'}
                    />
                  </div>

                  {formData.desktopNotifications && permissionStatus === 'granted' && (
                    <div className="ml-6 space-y-4">
                      {/* Sound Settings */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label 
                              htmlFor="notificationSound"
                              className="flex items-center gap-2"
                            >
                              <Volume2 className="h-4 w-4" />
                              {t('notifications.sound')}
                            </Label>
                          </div>
                          <Switch
                            id="notificationSound"
                            checked={formData.notificationSound}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({
                                ...prev,
                                notificationSound: checked
                              }))
                              updateSettings({ sound: checked })
                            }}
                          />
                        </div>

                        {formData.notificationSound && (
                          <div className="space-y-2">
                            <Label htmlFor="notificationVolume">
                              {t('notifications.volume')}
                            </Label>
                            <div className="flex items-center gap-4">
                              <Slider
                                id="notificationVolume"
                                value={[formData.notificationVolume]}
                                onValueChange={([value]) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    notificationVolume: value
                                  }))
                                }}
                                max={100}
                                step={1}
                                className="flex-1"
                              />
                              <span className="w-12 text-sm">
                                {formData.notificationVolume}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Event Reminders */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label 
                              htmlFor="eventReminders"
                              className="flex items-center gap-2"
                            >
                              <Clock className="h-4 w-4" />
                              {t('notifications.eventReminders')}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {t('notifications.eventRemindersDescription')}
                            </p>
                          </div>
                          <Switch
                            id="eventReminders"
                            checked={formData.eventReminders}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({
                                ...prev,
                                eventReminders: checked
                              }))
                            }}
                          />
                        </div>

                        {formData.eventReminders && (
                          <div className="ml-6 space-y-2">
                            <Label htmlFor="reminderTime">
                              {t('notifications.reminderTime')}
                            </Label>
                            <Select
                              value={formData.reminderTime}
                              onValueChange={(value: string) => {
                                setFormData(prev => ({
                                  ...prev,
                                  reminderTime: value
                                }))
                              }}
                            >
                              <SelectTrigger className="w-full">
                                {formData.reminderTime ? 
                                  `${formData.reminderTime} ${t('notifications.minutes')}` :
                                  t('notifications.selectTime')
                                }
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 {t('notifications.minutes')}</SelectItem>
                                <SelectItem value="10">10 {t('notifications.minutes')}</SelectItem>
                                <SelectItem value="15">15 {t('notifications.minutes')}</SelectItem>
                                <SelectItem value="30">30 {t('notifications.minutes')}</SelectItem>
                                <SelectItem value="60">60 {t('notifications.minutes')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {/* Test Notifications */}
                      <div className="pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleNotificationTest}
                          disabled={isTestingNotification}
                        >
                          {isTestingNotification 
                            ? t('notifications.testing')
                            : t('notifications.test')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Privacy Section */}
          <TabsContent value="privacy">
            <Card className="p-6">
              <div className="space-y-8">
                {/* Profile Visibility */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('privacy.profileVisibility')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('privacy.profileVisibilityDescription')}
                    </p>
                  </div>
                  <RadioGroup
                    value={formData.profileVisibility}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      profileVisibility: value
                    }))}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="visibility-public" />
                      <Label htmlFor="visibility-public">
                        {t('privacy.public')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friends" id="visibility-friends" />
                      <Label htmlFor="visibility-friends">
                        {t('privacy.friends')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="visibility-private" />
                      <Label htmlFor="visibility-private">
                        {t('privacy.private')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Calendar Visibility */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {t('privacy.calendarVisibility')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('privacy.calendarVisibilityDescription')}
                    </p>
                  </div>
                  <RadioGroup
                    value={formData.calendarVisibility}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      calendarVisibility: value
                    }))}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="calendar-public" />
                      <Label htmlFor="calendar-public">
                        {t('privacy.public')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friends" id="calendar-friends" />
                      <Label htmlFor="calendar-friends">
                        {t('privacy.friends')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="calendar-private" />
                      <Label htmlFor="calendar-private">
                        {t('privacy.private')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Section */}
          <TabsContent value="security">
            <Card className="p-6">
              <div className="space-y-8">
                {/* Two-Factor Authentication */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {t('security.twoFactor')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('security.twoFactorDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={formData.twoFactorEnabled}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          twoFactorEnabled: checked
                        }))
                      }}
                    />
                  </div>
                </div>

                {/* Login Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        {t('security.loginNotifications')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('security.loginNotificationsDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={formData.loginNotifications}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          loginNotifications: checked
                        }))
                      }}
                    />
                  </div>
                </div>

                {/* Session Timeout */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('security.sessionTimeout')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('security.sessionTimeoutDescription')}
                    </p>
                  </div>
                  <Select
                    value={formData.sessionTimeout}
                    onValueChange={(value: string) => {
                      setFormData(prev => ({
                        ...prev,
                        sessionTimeout: value
                      }))
                    }}
                  >
                    <SelectTrigger className="w-full">
                      {formData.sessionTimeout ? 
                        formData.sessionTimeout === '60' ? 
                          `1 ${t('security.hour')}` :
                        formData.sessionTimeout === '240' ? 
                          `4 ${t('security.hours')}` :
                          `${formData.sessionTimeout} ${t('security.minutes')}` :
                        t('security.selectTimeout')
                      }
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 {t('security.minutes')}</SelectItem>
                      <SelectItem value="30">30 {t('security.minutes')}</SelectItem>
                      <SelectItem value="60">1 {t('security.hour')}</SelectItem>
                      <SelectItem value="240">4 {t('security.hours')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
