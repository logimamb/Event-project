'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { EventForm } from '@/components/EventForm'
import { motion } from 'framer-motion'

interface NewEventClientProps {
  locale: string
}

export function NewEventClient({ locale }: NewEventClientProps) {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EventForm locale={locale} />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
} 