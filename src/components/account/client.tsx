'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { 
  BarChart3,
  Settings,
  User,
  Bell,
  Shield,
  Key,
  CreditCard,
  HelpCircle
} from 'lucide-react'

interface AccountSection {
  title: string
  description: string
  icon: React.ElementType
  href: string
}

export function AccountClient() {
  const t = useTranslations('account')
  const router = useRouter()

  const sections: AccountSection[] = [
    {
      title: t('sections.stats.title'),
      description: t('sections.stats.description'),
      icon: BarChart3,
      href: '/en/account/stats'
    },
    {
      title: t('sections.profile.title'),
      description: t('sections.profile.description'),
      icon: User,
      href: '/en/account/profile'
    },
    {
      title: t('sections.settings.title'),
      description: t('sections.settings.description'),
      icon: Settings,
      href: '/en/account/settings'
    },
    {
      title: t('sections.notifications.title'),
      description: t('sections.notifications.description'),
      icon: Bell,
      href: '/en/account/notifications'
    },
    {
      title: t('sections.security.title'),
      description: t('sections.security.description'),
      icon: Shield,
      href: '/en/account/security'
    },
    {
      title: t('sections.apiKeys.title'),
      description: t('sections.apiKeys.description'),
      icon: Key,
      href: '/en/account/api-keys'
    },
    {
      title: t('sections.billing.title'),
      description: t('sections.billing.description'),
      icon: CreditCard,
      href: '/en/account/billing'
    },
    {
      title: t('sections.help.title'),
      description: t('sections.help.description'),
      icon: HelpCircle,
      href: '/en/account/help'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card 
            key={section.title}
            className="hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => router.push(section.href)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <section.icon className="h-5 w-5" />
                <CardTitle>{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{section.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
