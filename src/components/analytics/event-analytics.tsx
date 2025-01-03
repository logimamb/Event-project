'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { format } from 'date-fns'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface EventAnalyticsProps {
  dateRange: DateRange | null
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

interface AnalyticsData {
  eventsByCategory: { name: string; value: number }[]
  eventTrends: { month: string; events: number; attendees: number }[]
  timeSlotDistribution: {
    morning: number
    afternoon: number
    evening: number
  }
  averageDurationByType: {
    type: string
    duration: number
  }[]
}

const EMPTY_DATA: AnalyticsData = {
  eventsByCategory: [],
  eventTrends: [],
  timeSlotDistribution: {
    morning: 0,
    afternoon: 0,
    evening: 0
  },
  averageDurationByType: []
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs"
    >
      {`${name} (${value})`}
    </text>
  )
}

export function EventAnalytics({ dateRange }: EventAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (dateRange?.from) {
          params.append('from', format(dateRange.from, 'yyyy-MM-dd'))
        }
        if (dateRange?.to) {
          params.append('to', format(dateRange.to, 'yyyy-MM-dd'))
        }

        const response = await fetch(`/api/analytics/events?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const analyticsData = await response.json()
        if (!analyticsData.eventsByCategory || !analyticsData.eventTrends) {
          throw new Error('Invalid data format received from server')
        }

        setData(analyticsData)
        setError(null)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load analytics data')
        setData(EMPTY_DATA)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        {error}
      </div>
    )
  }

  // Show empty state if no data
  if (data.eventsByCategory.length === 0 && data.eventTrends.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        No events found for the selected time period
      </div>
    )
  }

  // Convert timeSlotDistribution to array format for charts
  const timeSlotData = Object.entries(data.timeSlotDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }))

  // Calculate total events
  const totalEvents = data.eventsByCategory.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Active Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(data.timeSlotDistribution)
                .reduce((a, b) => (a[1] > b[1] ? a : b))[0]
                .charAt(0).toUpperCase() + 
                Object.entries(data.timeSlotDistribution)
                .reduce((a, b) => (a[1] > b[1] ? a : b))[0]
                .slice(1)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.averageDurationByType.length > 0
                ? `${Math.round(data.averageDurationByType.reduce((sum, item) => sum + item.duration, 0) / 
                    data.averageDurationByType.length)} hrs`
                : '0 hrs'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Distribution Chart */}
      {data.eventsByCategory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Event Distribution</CardTitle>
              <CardDescription>
                Distribution of events by status ({totalEvents} total events)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.eventsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={CustomPieLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.eventsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={CustomTooltip} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Event Trends Chart */}
      {data.eventTrends.length > 0 && (
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
                  <BarChart data={data.eventTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip content={CustomTooltip} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="events" fill="#8884d8" name="Events" />
                    <Bar yAxisId="right" dataKey="attendees" fill="#82ca9d" name="Attendees" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Time Slots Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Time Slot Distribution</CardTitle>
            <CardDescription>
              Distribution of events across different times of day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeSlotData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomPieLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timeSlotData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Average Duration by Type */}
      {data.averageDurationByType.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Average Duration by Event Type</CardTitle>
              <CardDescription>
                Average duration (in hours) for each event type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.averageDurationByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip content={CustomTooltip} />
                    <Legend />
                    <Bar dataKey="duration" fill="#8884d8" name="Duration (hours)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
