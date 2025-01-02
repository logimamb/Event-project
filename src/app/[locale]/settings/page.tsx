'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProfileSettings } from '@/components/settings/profile-settings'
import { EventSettings } from '@/components/settings/event-settings'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { PrivacySettings } from '@/components/settings/privacy-settings'
import { DisplaySettings } from '@/components/settings/display-settings'
import { SecuritySettings } from '@/components/settings/security-settings'
import { IntegrationsSettings } from '@/components/settings/integrations-settings'
import { useSettings } from '@/hooks/use-settings'
import { 
  User, 
  Calendar, 
  Bell, 
  Shield, 
  Monitor, 
  Lock, 
  Plug,
  Home,
  ChevronRight,
  CreditCard,
  Users,
  LogOut,
  Settings,
  HelpCircle,
  AlertTriangle
} from 'lucide-react'
import { SettingsLoadingState } from '@/components/settings/loading-state'

const settingsTabs = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    component: ProfileSettings,
    description: 'Manage your personal information and preferences',
  },
  {
    id: 'event',
    label: 'Events',
    icon: Calendar,
    component: EventSettings,
    description: 'Configure your event settings and defaults',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    component: NotificationSettings,
    description: 'Customize your notification preferences',
    badge: 'Updated',
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: Shield,
    component: PrivacySettings,
    description: 'Control your privacy and sharing settings',
  },
  {
    id: 'display',
    label: 'Display',
    icon: Monitor,
    component: DisplaySettings,
    description: 'Customize your display preferences',
  },
  {
    id: 'security',
    label: 'Security',
    icon: Lock,
    component: SecuritySettings,
    description: 'Manage your account security settings',
    badge: 'Important',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Plug,
    component: IntegrationsSettings,
    description: 'Manage your connected services and apps',
  },
]

const quickLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/help', label: 'Help & Support', icon: HelpCircle },
]

export default function SettingsContent() {
  const t = useTranslations('settings')
  const [activeTab, setActiveTab] = useState('profile')
  const { data: session } = useSession()
  const { isLoading, error } = useSettings()

  if (isLoading) {
    return <SettingsLoadingState />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('somethingWrong')}</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          {t('tryAgain')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main Navigation */}
      <aside className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-card">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Settings className="h-6 w-6" />
            <span>{t('eventManager')}</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4">
            <div className="py-2">
              <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">{t('quickLinks')}</h4>
              <nav className="space-y-1">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <Separator />
            <div className="py-2">
              <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">{t('account')}</h4>
              <div className="space-y-4 px-2">
                <div className="flex items-center gap-3">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{session?.user?.name}</p>
                    <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/api/auth/signout">
                    <LogOut className="h-4 w-4" />
                    {t('signOut')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        <div className="container space-y-6 p-10 pb-16">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-foreground">{t('dashboard')}</Link>
                <ChevronRight className="h-4 w-4" />
                <span>{t('settings')}</span>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />

          <Tabs
            defaultValue="profile"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0"
          >
            <aside className="-mx-4 lg:w-1/5">
              <Card className="p-1">
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <TabsList className="flex flex-col w-full">
                    {settingsTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="w-full flex items-center justify-between px-4 py-2 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <tab.icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge && (
                          <Badge variant={tab.badge === 'Important' ? 'destructive' : 'secondary'} className="ml-auto">
                            {tab.badge}
                          </Badge>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>
              </Card>
            </aside>

            <div className="flex-1 lg:max-w-2xl">
              <Card className="p-6">
                {settingsTabs.map((tab) => (
                  <TabsContent
                    key={tab.id}
                    value={tab.id}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <tab.icon className="h-5 w-5" />
                        {tab.label} {t('settings')}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {tab.description}
                      </p>
                    </div>
                    <Separator />
                    <div className="p-2">
                      <tab.component />
                    </div>
                  </TabsContent>
                ))}
              </Card>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

// import { Suspense } from 'react'
// import { LoadingState } from '@/components/shared/loading-state'
// import { SettingsLoadingState } from '@/components/settings/loading-state'

// export default function SettingsPage() {
//   return (
//     <Suspense fallback={<LoadingState />}>
//       <SettingsContent />
//     </Suspense>
//   )
// }
