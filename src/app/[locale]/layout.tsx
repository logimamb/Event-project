import '@/app/globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { notFound } from 'next/navigation'
import { locales } from '@/config/i18n'
import { RootLayoutContent } from '@/components/layout/root-layout'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

type Props = {
  children: React.ReactNode
  params: { locale: string }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

async function getMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default
  } catch (error) {
    notFound()
  }
}

export default async function RootLayout({
  children,
  params: { locale }
}: Props) {
  if (!locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages(locale)
  const session = await getServerSession(authOptions)

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={inter.className}>
        <RootLayoutContent
          locale={locale}
          messages={messages}
          session={session}
        >
          {children}
        </RootLayoutContent>
      </body>
    </html>
  )
}
