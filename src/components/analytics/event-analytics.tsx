'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface EventAnalyticsProps {
  dateRange: DateRange | null
}

const eventsByCategory = [
  { name: 'Conferences', value: 35 },
  { name: 'Workshops', value: 45 },
  { name: 'Seminars', value: 25 },
  { name: 'Webinars', value: 30 },
  { name: 'Meetups', value: 20 },
]

const eventTrends = [
  { month: 'Jan', events: 20, attendees: 400 },
  { month: 'Feb', events: 25, attendees: 500 },
  { month: 'Mar', events: 30, attendees: 600 },
  { month: 'Apr', events: 35, attendees: 700 },
  { month: 'May', events: 40, attendees: 800 },
  { month: 'Jun', events: 45, attendees: 900 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function EventAnalytics({ dateRange }: EventAnalyticsProps) {
  return (
    <div className="space-y-8">
      {/* Event Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
            <CardDescription>
              Distribution of events by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eventsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Event Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Event Trends</CardTitle>
            <CardDescription>
              Monthly trends of events and attendees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="events" fill="#8884d8" name="Events" />
                  <Bar yAxisId="right" dataKey="attendees" fill="#82ca9d" name="Attendees" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Event Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>Popular Time Slots</CardTitle>
            <CardDescription>Most preferred event timings</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <span>Morning (9 AM - 12 PM)</span>
                <span className="font-semibold">35%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Afternoon (1 PM - 4 PM)</span>
                <span className="font-semibold">40%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Evening (5 PM - 8 PM)</span>
                <span className="font-semibold">25%</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Duration</CardTitle>
            <CardDescription>Average duration by event type</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <span>Conferences</span>
                <span className="font-semibold">6.5 hours</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Workshops</span>
                <span className="font-semibold">4 hours</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Seminars</span>
                <span className="font-semibold">2.5 hours</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 
