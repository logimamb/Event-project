'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'
import { format } from 'date-fns'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from 'next-intl'

interface ActivityAnalyticsProps {
  dateRange: DateRange | null
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

interface AnalyticsData {
  activitiesByStatus: { name: string; value: number }[]
  activityTrends: { month: string; activities: number; participants: number }[]
  participationStats: {
    totalParticipants: number
    averageParticipants: number
    maxParticipants: number
  }
  timeDistribution: {
    morning: number
    afternoon: number
    evening: number
  }
  statusDistribution: { status: string; count: number }[]
  completionRate: number
}

const EMPTY_DATA: AnalyticsData = {
  activitiesByStatus: [],
  activityTrends: [],
  participationStats: {
    totalParticipants: 0,
    averageParticipants: 0,
    maxParticipants: 0
  },
  timeDistribution: {
    morning: 0,
    afternoon: 0,
    evening: 0
  },
  statusDistribution: [],
  completionRate: 0
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

export function ActivityAnalytics({ dateRange }: ActivityAnalyticsProps) {
  const t = useTranslations('analytics')
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

        const response = await fetch(`/api/analytics/activities?${params.toString()}`)
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
  if (data.activitiesByStatus.length === 0 && data.activityTrends.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        {t('activities.noActivities')}
      </div>
    )
  }

  // Convert timeDistribution to array format for charts
  const timeSlotData = Object.entries(data.timeDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }))

  // Calculate total activities
  const totalActivities = data.activitiesByStatus.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('activities.totalActivities')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('activities.totalParticipants')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.participationStats.totalParticipants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('activities.avgParticipants')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.participationStats.averageParticipants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('activities.completionRate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.completionRate)}%</div>
            <Progress value={data.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Activity Status Distribution */}
      {data.activitiesByStatus.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('activities.activityStatusDistribution')}</CardTitle>
              <CardDescription>
                {t('activities.distributionOfActivitiesByStatus')} ({totalActivities} {t('activities.totalActivities')})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.activitiesByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={CustomPieLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.activitiesByStatus.map((entry, index) => (
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

      {/* Activity Trends */}
      {data.activityTrends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('activities.activityTrends')}</CardTitle>
              <CardDescription>
                {t('activities.monthlyTrendsOfActivitiesAndParticipants')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.activityTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip content={CustomTooltip} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="activities"
                      stroke="#8884d8"
                      name={t('activities.title')}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="participants"
                      stroke="#82ca9d"
                      name={t('activities.participants')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Time Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('activities.timeDistribution')}</CardTitle>
            <CardDescription>
              {t('activities.monthlyTrendsOfActivitiesAndParticipants')}
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

      {/* Status Distribution Over Time */}
      {data.statusDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('activities.statusDistribution')}</CardTitle>
              <CardDescription>
                {t('activities.distributionOfActivitiesByStatus')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip content={CustomTooltip} />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name={t('activities.title')} />
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
