import { unstable_setRequestLocale } from 'next-intl/server'
import { Footer } from '@/components/layout/Footer'
import { Icons } from "@/components/icons"
import { useTranslations, useLocale } from 'next-intl'

export default function AuthLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('auth')

  return (
    <div className="relative min-h-screen">
      <div className="pb-24">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-6xl w-full mx-auto grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="">
            {/* Left side - Branding */}
          <div className="relative hidden lg:flex flex-col justify-between p-8 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-3xl shadow-2xl min-h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <Icons.logo className="h-10 w-10" />
              <h1 className="text-2xl font-bold">{t('branding.title')}</h1>
            </div>
            <p className="text-xl font-light text-indigo-100 mb-8">
              {t('branding.subtitle')}
            </p>
          </div>
          <div className="relative space-y-6">
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
              <blockquote className="text-lg font-light">
                {t('testimonial.quote')}
              </blockquote>
              <footer className="mt-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl font-semibold">SJ</span>
                </div>
                <div>
                  <p className="font-medium">{t('testimonial.author')}</p>
                  <p className="text-sm text-indigo-200">{t('testimonial.role')}</p>
                </div>
              </footer>
            </div>
          </div>
        </div>
          </div>
          <div className="w-full max-w-[450px] mx-auto lg:max-w-none p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl">
            {children}
          </div>
        </div>
      </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
