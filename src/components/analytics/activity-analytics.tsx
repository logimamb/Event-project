'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Progress } from '@/components/ui/progress'

interface ActivityAnalyticsProps {
  dateRange: DateRange | null
}

const activityProgress = [
  { status: 'Completed', count: 245, percentage: 45 },
  { status: 'In Progress', count: 180, percentage: 33 },
  { status: 'Not Started', count: 120, percentage: 22 },
]

const activityTrends = [
  { day: 'Mon', completed: 42, inProgress: 28, notStarted: 15 },
  { day: 'Tue', completed: 38, inProgress: 32, notStarted: 18 },
  { day: 'Wed', completed: 45, inProgress: 25, notStarted: 12 },
  { day: 'Thu', completed: 40, inProgress: 30, notStarted: 20 },
  { day: 'Fri', completed: 35, inProgress: 35, notStarted: 22 },
  { day: 'Sat', completed: 30, inProgress: 40, notStarted: 25 },
  { day: 'Sun', completed: 25, inProgress: 45, notStarted: 28 },
]

const completionRate = [
  { week: 'W1', rate: 75 },
  { week: 'W2', rate: 82 },
  { week: 'W3', rate: 78 },
  { week: 'W4', rate: 85 },
  { week: 'W5', rate: 88 },
  { week: 'W6', rate: 92 },
]

export function ActivityAnalytics({ dateRange }: ActivityAnalyticsProps) {
  return (
    <div className="space-y-8">
      {/* Activity Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-3"
      >
        {activityProgress.map((status, index) => (
          <Card key={status.status}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {status.status}
              </CardTitle>
              <span className="text-2xl font-bold">{status.count}</span>
            </CardHeader>
            <CardContent>
              <Progress value={status.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {status.percentage}% of total activities
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Activity Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Activity Trends</CardTitle>
            <CardDescription>Daily activity status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="1"
                    stroke="#4CAF50"
                    fill="#4CAF50"
                    name="Completed"
                  />
                  <Area
                    type="monotone"
                    dataKey="inProgress"
                    stackId="1"
                    stroke="#2196F3"
                    fill="#2196F3"
                    name="In Progress"
                  />
                  <Area
                    type="monotone"
                    dataKey="notStarted"
                    stackId="1"
                    stroke="#FFC107"
                    fill="#FFC107"
                    name="Not Started"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Completion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
            <CardDescription>Weekly activity completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completionRate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Completion Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 
