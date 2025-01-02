'use client'

import { Inter } from 'next/font/google'
import { ClientErrorBoundary } from '@/components/client-error-boundary'
import { NextIntlClientProvider } from 'next-intl'
import { Footer } from '@/components/layout/Footer'
import { NotificationProvider } from '@/contexts/notification-context'
import { Providers } from '@/components/providers'
import { Session } from 'next-auth'

const inter = Inter({ subsets: ['latin'] })

interface RootLayoutProps {
  children: React.ReactNode
  locale: string
  messages: any
  session: Session | null
}

export function RootLayoutContent({ children, locale, messages, session }: RootLayoutProps) {
  return (
    <Providers session={session}>
      <ClientErrorBoundary>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </NextIntlClientProvider>
      </ClientErrorBoundary>
    </Providers>
  )
}
