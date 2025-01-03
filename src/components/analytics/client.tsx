'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnalyticsOverview } from './overview'
import { EventAnalytics } from './event-analytics'
import { ActivityAnalytics } from './activity-analytics'
import { AttendeeAnalytics } from './attendee-analytics'
import { DateRange } from 'react-day-picker'
import { addDays, subDays } from 'date-fns'
import { useTranslations } from '@/lib/use-translations'
import { WaitAnalytics } from './wait-analytics'

export function AnalyticsClient() {
  const { t } = useTranslations()
  const [dateRange, setDateRange] = useState<DateRange | null>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold tracking-tight" tabIndex={0}>
            Analytics & Insights
          </h1>
          <p className="text-muted-foreground" tabIndex={0}>
            Comprehensive analytics and performance metrics for your events
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-auto"
        >
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-full md:w-[300px]"
          />
        </motion.div>
      </div>

      {/* Analytics Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <AnalyticsOverview dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <EventAnalytics dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <ActivityAnalytics dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="attendees" className="space-y-4">
            <WaitAnalytics dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
} 
