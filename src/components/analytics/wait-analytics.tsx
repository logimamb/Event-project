'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'
import { format } from 'date-fns'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Progress } from '@/components/ui/progress'

interface WaitAnalyticsProps {
  dateRange: DateRange | null
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

interface AnalyticsData {
  averageWaitTime: number
  waitTimeDistribution: { name: string; value: number }[]
  waitTimeByDay: { day: string; average: number }[]
  waitTimeByStatus: { status: string; average: number }[]
  waitTimeStats: {
    min: number
    max: number
    median: number
    total: number
  }
  peakWaitTimes: {
    morning: number
    afternoon: number
    evening: number
  }
}

const EMPTY_DATA: AnalyticsData = {
  averageWaitTime: 0,
  waitTimeDistribution: [],
  waitTimeByDay: [],
  waitTimeByStatus: [],
  waitTimeStats: {
    min: 0,
    max: 0,
    median: 0,
    total: 0
  },
  peakWaitTimes: {
    morning: 0,
    afternoon: 0,
    evening: 0
  }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value} {entry.name.toLowerCase().includes('time') ? 'minutes' : ''}
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

function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export function WaitAnalytics({ dateRange }: WaitAnalyticsProps) {
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

        const response = await fetch(`/api/analytics/waits?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const analyticsData = await response.json()
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
  if (data.waitTimeDistribution.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        No wait time data found for the selected time period
      </div>
    )
  }

  // Convert peak wait times to array format for chart
  const peakWaitData = Object.entries(data.peakWaitTimes).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }))

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMinutes(data.averageWaitTime)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Median Wait Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMinutes(data.waitTimeStats.median)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Shortest Wait</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMinutes(data.waitTimeStats.min)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Longest Wait</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMinutes(data.waitTimeStats.max)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Wait Time Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Wait Time Distribution</CardTitle>
            <CardDescription>
              Distribution of wait times across different ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.waitTimeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Activities" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Wait Time by Day */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Average Wait Time by Day</CardTitle>
            <CardDescription>
              Average wait times for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.waitTimeByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                  <Bar dataKey="average" fill="#82ca9d" name="Average Wait Time (minutes)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Wait Time by Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Wait Time by Status</CardTitle>
            <CardDescription>
              Average wait times for different activity statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.waitTimeByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                  <Bar dataKey="average" fill="#8884d8" name="Average Wait Time (minutes)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Peak Wait Times */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Peak Wait Times</CardTitle>
            <CardDescription>
              Total wait times during different periods of the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={peakWaitData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomPieLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {peakWaitData.map((entry, index) => (
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
    </div>
  )
}
