'use client'

import { CreateEventForm } from '@/components/event/create-event-form'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'

export function CreateEventPageContent() {
  const router = useRouter()
  const t = useTranslations('events')

  return (
    <DashboardLayout>
      <div className="container px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">{t('form.createTitle')}</h1>
              <p className="text-base text-muted-foreground max-w-2xl">
                {t('form.description')}
              </p>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => router.back()}
              className="shrink-0"
            >
              {t('form.cancel')}
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-card shadow-sm">
                <div className="p-6">
                  <CreateEventForm />
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border bg-card shadow-sm p-6 space-y-6 sticky top-8">
                <div>
                  <h3 className="font-semibold mb-2">{t('form.helpTitle')}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• {t('form.helpTip1')}</li>
                    <li>• {t('form.helpTip2')}</li>
                    <li>• {t('form.helpTip3')}</li>
                  </ul>
                </div>
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-2">{t('form.previewTitle')}</h3>
                  <p className="text-sm text-muted-foreground">{t('form.previewDescription')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
